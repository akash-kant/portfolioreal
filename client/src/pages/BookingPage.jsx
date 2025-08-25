import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Calendar } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: user?.name || '', email: user?.email || ''});

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: service, isLoading: isLoadingService } = useQuery(['service', serviceId], () =>
    api.get(`/services/${serviceId}`).then(res => res.data.data)
  );
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const { data: availability, isLoading: isLoadingAvailability } = useQuery(
    ['availability', serviceId, formattedDate],
    () => api.get(`/bookings/availability/${serviceId}?date=${formattedDate}`).then(res => res.data.data),
    { enabled: !!service }
  );
  
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setSelectedSlot(null); // Reset selected time slot when a new date is picked
  };

  const handlePayment = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot.');
      return;
    }
    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please enter your name and email.');
      return;
    }

    const toastId = toast.loading('Initializing payment...');

    try {
      // 1. Create booking and Razorpay order on the backend
      const bookingResponse = await api.post('/bookings', {
        serviceId,
        scheduledDateTime: selectedSlot.datetime,
        customerInfo,
      });
      
      const { booking, razorpayOrder } = bookingResponse.data.data;
      
      toast.dismiss(toastId);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your .env file
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Akash Kant Portfolio',
        description: `Booking for ${service.title}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          const paymentToast = toast.loading('Verifying payment...');
          try {
            // 3. Verify payment on the backend
            await api.post('/bookings/confirm-payment', {
              bookingId: booking._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Booking confirmed!', { id: paymentToast });
            navigate('/booking-success');
          } catch (verifyError) {
            toast.error('Payment verification failed.', { id: paymentToast });
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error('Could not initiate booking. The slot might have been taken.', { id: toastId });
    }
  };


  if (isLoadingService) return <p className="text-center py-10">Loading Service...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Book a Session: {service.title}</h1>
      <p className="text-lg text-secondary-600 mb-8">{service.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">1. Select a Date</h2>
          <div style={{ height: 500 }}>
             <Calendar
                localizer={localizer}
                events={[]}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                defaultDate={new Date()}
             />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Select a Time</h2>
          <p className="mb-4">Available slots for: <strong>{format(selectedDate, 'MMMM do, yyyy')}</strong></p>
          {isLoadingAvailability ? (
             <p>Loading slots...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availability?.length > 0 ? (
                availability.map(slot => (
                  <button
                    key={slot.datetime}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 border rounded-md text-center text-sm ${selectedSlot?.datetime === slot.datetime ? 'bg-primary-600 text-white' : 'bg-white hover:border-primary-600'}`}
                  >
                    {slot.time}
                  </button>
                ))
              ) : (
                <p className="text-secondary-500 col-span-2">No available slots for this day.</p>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-8 p-4 bg-primary-50 rounded-lg">
               <h3 className="text-xl font-semibold mb-4">3. Your Information</h3>
               {!user && (
                 <>
                   <div className="mb-4">
                     <label className="block text-sm font-medium mb-1">Name</label>
                     <input type="text" className="input" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                   </div>
                   <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Email</label>
                     <input type="email" className="input" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
                   </div>
                 </>
               )}
               <div className="font-bold text-lg">
                  Total: ₹{service.price}
               </div>
               <p className="text-sm text-secondary-600">For {service.title} on {format(new Date(selectedSlot.datetime), 'MMMM do, yyyy')} at {selectedSlot.time}</p>
               <button onClick={handlePayment} className="btn btn-primary w-full mt-4">
                 Proceed to Pay
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
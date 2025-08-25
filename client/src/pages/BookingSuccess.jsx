import React from 'react';
import { Link } from 'react-router-dom';

const BookingSuccess = () => {
  return (
    <div className="text-center py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-4xl font-bold text-secondary-900">Booking Successful!</h1>
        <p className="mt-4 text-lg text-secondary-600">
          Thank you for your booking. A confirmation email with your meeting details has been sent to you.
        </p>
        <div className="mt-8">
          <Link to="/" className="btn btn-primary">
            Go back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
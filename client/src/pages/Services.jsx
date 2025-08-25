import React from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const ServiceCard = ({ service }) => (
  <div className="card flex flex-col justify-between">
    <div className="p-6">
      <h3 className="text-xl font-bold text-secondary-900">{service.title}</h3>
      <p className="mt-2 text-secondary-600">{service.description}</p>
      <p className="mt-4 text-2xl font-bold text-primary-600">
        ₹{service.price}
        <span className="text-sm font-normal text-secondary-500"> for {service.duration} mins</span>
      </p>
      <ul className="mt-4 space-y-2 text-sm text-secondary-700">
        {service.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="p-6 bg-secondary-50 rounded-b-lg">
      <Link to={`/booking/${service._id}`} className="btn btn-primary w-full group">
        <span>Book Now</span>
        <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);


const Services = () => {
  const { data: services, isLoading, error } = useQuery('services', () =>
    api.get('/services').then(res => res.data.data)
  );

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Professional Services</h2>
          <p className="mt-2 text-lg leading-8 text-secondary-600">
            Accelerate your career with personalized 1-on-1 guidance and expert reviews.
          </p>
        </div>

        {isLoading && <p className="text-center mt-12">Loading services...</p>}
        {error && <p className="text-center text-red-500 mt-12">Failed to load services. Please try again later.</p>}

        {services && (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {services.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
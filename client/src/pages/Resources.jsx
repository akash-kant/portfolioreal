import { useQuery } from 'react-query';
import ResourceCard from '../components/resources/ResourceCard';
import api from '../services/api';

const Resources = () => {
  const { data: resources, isLoading, error } = useQuery('resources', () =>
    api.get('/resources').then(res => res.data.data)
  );
  
  const handlePurchase = (resource) => {
    // Implement purchase logic, e.g., redirect to payment page or open a modal
    console.log('Purchasing:', resource.title);
    alert(`This would trigger the purchase flow for ${resource.title}.`);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-secondary-900">My Resources</h2>
        <p className="mt-2 text-lg leading-8 text-secondary-600">
            Helpful guides, templates, and cheat sheets to accelerate your growth.
        </p>

        {isLoading && <p className="text-center mt-8">Loading resources...</p>}
        {error && <p className="text-center text-red-500 mt-8">Failed to load resources.</p>}
        {resources && (
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} onPurchase={handlePurchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
import { useQuery } from 'react-query';
import BlogCard from '../components/blog/BlogCard';
import api from '../services/api';

const Blog = () => {
  const { data: blogs, isLoading, error } = useQuery('blogs', () =>
    api.get('/blog').then(res => res.data.data)
  );

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">From the Blog</h2>
          <p className="mt-2 text-lg leading-8 text-secondary-600">
            Insights, tutorials, and career advice for developers.
          </p>
        </div>
        {isLoading && <p className="text-center mt-8">Loading posts...</p>}
        {error && <p className="text-center text-red-500 mt-8">Failed to load posts.</p>}
        {blogs && (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
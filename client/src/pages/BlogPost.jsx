import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const BlogPost = () => {
  const { slug } = useParams(); // Note: Changed from 'id' to 'slug' to match App.jsx
  const { data: post, isLoading, error } = useQuery(['blogPost', slug], () =>
    // The API controller uses findById, so we pass the slug/id here. 
    // You might need to adjust the backend to fetch by slug.
    api.get(`/blog/${slug}`).then(res => res.data.data)
  );

  if (isLoading) return <p className="text-center py-10">Loading post...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Error loading post.</p>;
  if (!post) return <p className="text-center py-10">Post not found.</p>;
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary-600">{post.category}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-x-4 text-xs">
          <time dateTime={post.publishedAt} className="text-gray-500">
            {formatDate(post.publishedAt)}
          </time>
        </div>
        
        <figure className="mt-16">
          <img
            className="aspect-video rounded-xl bg-gray-50 object-cover"
            src={post.coverImage}
            alt={post.title}
          />
        </figure>
        
        <div className="mt-10 prose lg:prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
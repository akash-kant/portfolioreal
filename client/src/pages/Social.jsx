import React from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { motion } from 'framer-motion';

const YouTubeCard = ({ video }) => (
  <a href={video.url} target="_blank" rel="noopener noreferrer" className="card group overflow-hidden">
    <div className="relative">
      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-secondary-800 group-hover:text-primary-600 line-clamp-2">{video.title}</h3>
      <p className="text-xs text-secondary-500 mt-1">{new Date(video.publishedAt).toLocaleDateString()}</p>
    </div>
  </a>
);

const InstagramCard = ({ post }) => (
  <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="group relative block">
    <img
      src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url}
      alt={post.caption || 'Instagram Post'}
      className="w-full h-full object-cover aspect-square"
    />
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center p-4">
       <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm line-clamp-4">{post.caption}</p>
    </div>
  </a>
);


const Social = () => {
  const { data: videos, isLoading: isLoadingYouTube } = useQuery('youtube', () =>
    api.get('/social/youtube').then(res => res.data.data)
  );

  const { data: posts, isLoading: isLoadingInstagram } = useQuery('instagram', () =>
    api.get('/social/instagram').then(res => res.data.data)
  );

  return (
    <div className="py-16 sm:py-24 bg-secondary-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Connect With Me</h2>
          <p className="mt-2 text-lg leading-8 text-secondary-600">
            Follow my journey, tutorials, and insights across my social platforms.
          </p>
        </div>

        {/* YouTube Section */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-secondary-900 mb-8">Latest on YouTube</h3>
          {isLoadingYouTube && <p>Loading videos...</p>}
          {videos && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {videos.map((video, index) => (
                 <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                 >
                   <YouTubeCard video={video} />
                 </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Instagram Section */}
        <section className="mt-20">
          <h3 className="text-2xl font-bold text-secondary-900 mb-8">Recent on Instagram</h3>
          {isLoadingInstagram && <p>Loading posts...</p>}
          {posts && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
               {posts.map((post, index) => (
                 <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="overflow-hidden rounded-lg"
                 >
                    <InstagramCard post={post} />
                 </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Social;
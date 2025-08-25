import { useQuery } from 'react-query';
import ProjectCard from '../components/projects/ProjectCard';
import api from '../services/api';

const Projects = () => {
  const { data: projects, isLoading, error } = useQuery('projects', () =>
    api.get('/projects').then(res => res.data.data)
  );

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">My Projects</h2>
          <p className="mt-2 text-lg leading-8 text-secondary-600">
            A showcase of my recent work and the technologies I'm passionate about.
          </p>
        </div>
        {isLoading && <p className="text-center mt-8">Loading projects...</p>}
        {error && <p className="text-center text-red-500 mt-8">Failed to load projects.</p>}
        {projects && (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
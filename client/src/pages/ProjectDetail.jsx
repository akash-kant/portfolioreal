import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { CodeBracketIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project, isLoading, error } = useQuery(['project', id], () =>
    api.get(`/projects/${id}`).then(res => res.data.data)
  );

  if (isLoading) return <p className="text-center py-10">Loading project details...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Error loading project.</p>;
  if (!project) return <p className="text-center py-10">Project not found.</p>;

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900">{project.title}</h1>
          <p className="mt-4 text-xl text-secondary-600">{project.description}</p>
        </div>

        {/* Image Gallery */}
        <div className="mb-12">
          {project.images && project.images.length > 0 && (
            <img src={project.images[0]} alt={project.title} className="w-full h-auto rounded-lg shadow-lg object-cover" />
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column (Details) */}
          <div className="md:col-span-1 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-secondary-800 mb-2">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span key={tech} className="px-2 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-md">{tech}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-800 mb-2">Category</h3>
              <p className="text-secondary-600">{project.category}</p>
            </div>
            {(project.demoUrl || project.githubUrl) && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-3">Links</h3>
                <div className="space-y-3">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" /> Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                      <CodeBracketIcon className="w-5 h-5 mr-2" /> View Code
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Description) */}
          <div className="md:col-span-2 prose">
            {project.detailedDescription ? (
              <div dangerouslySetInnerHTML={{ __html: project.detailedDescription }} />
            ) : (
              <p>No detailed description available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
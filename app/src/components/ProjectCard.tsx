import { useState } from 'react';
import { MapPin, Calendar, ExternalLink, Box } from 'lucide-react';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  index: number;
  isVisible: boolean;
  onView3D: (project: Project) => void;
}

export default function ProjectCard({ project, index, isVisible, onView3D }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-70'
          }`}
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              project.category === 'civil'
                ? 'bg-engine-blue text-white'
                : 'bg-engine-orange text-white'
            }`}
          >
            {project.category === 'civil' ? 'Civil' : 'Elétrico'}
          </span>
        </div>

        {/* 3D Model Badge */}
        {project.sketchfabId && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" />
              3D
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white font-display mb-2">
            {project.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {project.year}
            </span>
          </div>

          {/* Description - Shows on Hover */}
          <p
            className={`text-white/80 text-sm leading-relaxed transition-all duration-300 ${
              isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
            } overflow-hidden`}
          >
            {project.description}
          </p>

          {/* Action Buttons */}
          <div
            className={`mt-4 flex gap-3 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {project.sketchfabId && (
              <button
                onClick={() => onView3D(project)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg transition-colors"
              >
                <Box className="w-4 h-4" />
                Ver em 3D
              </button>
            )}
            <button className="inline-flex items-center gap-2 text-engine-orange font-medium text-sm hover:underline">
              Ver Projeto
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

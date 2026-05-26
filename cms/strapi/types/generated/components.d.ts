import type { Schema, Struct } from '@strapi/strapi';

export interface ProjectProjectImage extends Struct.ComponentSchema {
  collectionName: 'components_project_project_images';
  info: {
    description: 'Image inside a brand/project gallery';
    displayName: 'Project Image';
  };
  attributes: {
    alt: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'project.project-image': ProjectProjectImage;
    }
  }
}

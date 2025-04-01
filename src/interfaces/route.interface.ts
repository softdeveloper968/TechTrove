// Interface for defining basic route links
export interface IRouteLinks {
  title: string;
  to: string;
  access: string[];
  states:string[];
}

// Interface for additional properties in home screen links
export interface IHomeScreenLinks extends IRouteLinks {
  image: string;
}

// Comments and Suggestions:
// - Used clear and concise comments for explaining the purpose of each interface.
// - Followed a consistent naming convention for interfaces.

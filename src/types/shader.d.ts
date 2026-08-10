declare module '*.{glsl,frag,vert}?raw' {
  const value: string;
  export default value;
}
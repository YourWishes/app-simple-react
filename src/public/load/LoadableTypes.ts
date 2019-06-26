//Type for a component that is to BECOME loaded

//Until I can figure out a better way of handling a () => import() return type, this wil do
export type LoadedComponent<Props> = any;

//Loader (The actual loader function), so () => import not the import statement alone
export type Loader<Props> = (
  () => Promise<LoadedComponent<Props>>
);

//Placeholder (component to show during load), this will receive data from the loadable component
export type LoadablePlaceholderProps<Props> = (
  LoadableComponentProps<Props> & LoadableComponentState
);

//Placeholder Component Type, not an instance but the type reference, e.g. div not <div>
//or () => <Header /> not <Header />
export type LoadablePlaceholder<Props> = (
  React.ComponentType<LoadablePlaceholderProps<Props>> |
  ( (props:LoadablePlaceholderProps<Props>) => JSX.Element )
);

//Loadable Component (Component will manage the load process)
export type LoadableComponentProps<P> = {
  load:Loader<P>,
  loadKey:string,
  loading?:LoadablePlaceholder<P>,
  loadedExport?:string,
  simulate?:boolean|number
} & P;

export type LoadableComponentState = {
  loading:boolean,
  loaded:boolean,
  error:any|null
};

//Loadable Listener
export interface LoadableListener<Props> {
  onLoading(key:string)=>void;
  onLoad:(key:string, component:LoadedComponent<Props>)=>void;
  onLoadError:(key:string, error:any)=>void;
}

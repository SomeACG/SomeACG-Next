type Router = {
  name?: string;
  key?: string;
  path: string;
};

export const Routes = {
  Home: '/',
  About: '/about',
};

export const routers: Router[] = [
  { name: '首页', path: Routes.Home },
  { name: '关于', path: Routes.About },
];

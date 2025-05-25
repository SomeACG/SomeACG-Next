type Router = {
  name?: string;
  key?: string;
  path: string;
};

export const Routes = {
  Home: '/',
  About: '/about',
  Friends: '/friends',
  Tags: '/tag',
  Artists: '/artists',
};

export const routers: Router[] = [
  { name: '首页', path: Routes.Home },
  { name: '关于', path: Routes.About },
  { name: '友链', path: Routes.Friends },
  { name: '标签', path: Routes.Tags },
  { name: '画师', path: Routes.Artists },
];

import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';

import { Layout } from '@/lib/layout';

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Layout>
        <Outlet />
      </Layout>
    </>
  ),
});

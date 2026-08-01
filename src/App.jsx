import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./ui/AppLayout";
import ProtectedAdminRoute from "./ui/ProtectedAdminRoute";
import RouterErrorElement from "./ui/RouterErrorElement";
import LoadingSpinner from "./ui/LoadingSpinner";

// Páginas cargadas bajo demanda (code-splitting). Así el visitante de TikTok
// no descarga el panel de admin ni páginas que no va a ver en la primera carga.
const Home = lazy(() => import("./pages/Home"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Testimonios = lazy(() => import("./pages/Testimonios"));
const BestSellers = lazy(() => import("./pages/BestSellers"));
const VistoEnTikTok = lazy(() => import("./pages/VistoEnTikTok"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Prehome = lazy(() => import("./pages/Prehome"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const Casas = lazy(() => import("./pages/Casas"));
const SobreMi = lazy(() => import("./pages/SobreMi"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Privacidad = lazy(() => import("./pages/Privacidad"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminPedidoRapido = lazy(() => import("./pages/AdminPedidoRapido"));
const AdminPerfumesList = lazy(() => import("./pages/AdminPerfumesList"));
const AdminPerfumeEdit = lazy(() => import("./pages/AdminPerfumeEdit"));
const AdminPerfumeCreate = lazy(() => import("./pages/AdminPerfumeCreate"));
const AdminTestimoniosList = lazy(() => import("./pages/AdminTestimoniosList"));
const AdminTestimonioCreate = lazy(() =>
  import("./pages/AdminTestimonioCreate"),
);
const AdminTestimonioEdit = lazy(() => import("./pages/AdminTestimonioEdit"));
const AdminCasasList = lazy(() => import("./pages/AdminCasasList"));
const AdminCasaEdit = lazy(() => import("./pages/AdminCasaEdit"));
const AdminAvisos = lazy(() => import("./pages/AdminAvisos"));
const AdminCodigosList = lazy(() => import("./pages/AdminCodigosList"));
const AdminBlogList = lazy(() => import("./pages/AdminBlogList"));
const AdminBlogForm = lazy(() => import("./pages/AdminBlogForm"));

const router = createBrowserRouter([
  // Rutas públicas con AppLayout
  {
    element: <AppLayout />,
    errorElement: <RouterErrorElement />,
    children: [
      { path: "/", element: <Prehome /> },
      { path: "/home", element: <Home /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/botellas", element: <Home forcedMode="stock" /> },
      { path: "/decants", element: <Home forcedMode="decants" /> },
      { path: "/casa/:slug", element: <Home /> },
      { path: "/faqs", element: <FAQs /> },
      { path: "/testimonios", element: <Testimonios /> },
      { path: "/casas", element: <Casas /> },
      { path: "/best-sellers", element: <BestSellers /> },
      { path: "/tiktok", element: <VistoEnTikTok /> },
      { path: "/recien-llegados", element: <Home forcedMode="recientes" /> },
      { path: "/sobre-mi", element: <SobreMi /> },
      { path: "/terminos", element: <Terminos /> },
      { path: "/privacidad", element: <Privacidad /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      { path: "/product/:nombre/:id", element: <ProductDetail /> },
      { path: "*", element: <NotFound /> },
    ],
  },

  // Rutas de admin (sin AppLayout)
  {
    path: "/admin/login",
    element: <AdminLogin />,
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminPanel />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Pedido rápido (mostrador de bazar)
  {
    path: "/admin/pedido-rapido",
    element: (
      <ProtectedAdminRoute>
        <AdminPedidoRapido />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Perfumes admin
  {
    path: "/admin/perfumes",
    element: (
      <ProtectedAdminRoute>
        <AdminPerfumesList />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/perfumes/nuevo",
    element: (
      <ProtectedAdminRoute>
        <AdminPerfumeCreate />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/perfumes/:id",
    element: (
      <ProtectedAdminRoute>
        <AdminPerfumeEdit />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Testimonios admin
  {
    path: "/admin/testimonios",
    element: (
      <ProtectedAdminRoute>
        <AdminTestimoniosList />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/testimonios/nuevo",
    element: (
      <ProtectedAdminRoute>
        <AdminTestimonioCreate />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/testimonios/:id",
    element: (
      <ProtectedAdminRoute>
        <AdminTestimonioEdit />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Casas admin
  {
    path: "/admin/casas",
    element: (
      <ProtectedAdminRoute>
        <AdminCasasList />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/casas/:id",
    element: (
      <ProtectedAdminRoute>
        <AdminCasaEdit />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Avisos de stock admin
  {
    path: "/admin/avisos",
    element: (
      <ProtectedAdminRoute>
        <AdminAvisos />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Cupones admin
  {
    path: "/admin/cupones",
    element: (
      <ProtectedAdminRoute>
        <AdminCodigosList />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },

  // Blog admin
  {
    path: "/admin/blog",
    element: (
      <ProtectedAdminRoute>
        <AdminBlogList />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/blog/nuevo",
    element: (
      <ProtectedAdminRoute>
        <AdminBlogForm />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/admin/blog/:id",
    element: (
      <ProtectedAdminRoute>
        <AdminBlogForm />
      </ProtectedAdminRoute>
    ),
    errorElement: <RouterErrorElement />,
  },
]);

function App() {
  // Suspense de respaldo para las rutas que no pasan por AppLayout (admin).
  // Las páginas públicas tienen su propio Suspense alrededor del <Outlet/>.
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;

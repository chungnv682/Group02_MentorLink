import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, ThemeProvider, useAuth } from "./contexts";
import { AuthLoader } from "./components/auth";
import routes from "./routes";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

const queryClient = new QueryClient();

// Component để kiểm tra loading state
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  return <RouterProvider router={routes} />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

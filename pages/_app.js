import { AuthProvider } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp; 
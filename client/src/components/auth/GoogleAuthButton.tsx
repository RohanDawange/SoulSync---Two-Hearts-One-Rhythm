import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function GoogleAuthButton() {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <Button
      variant="secondary"
      fullWidth
      size="lg"
      icon={<FcGoogle size={20} />}
      loading={loading}
      onClick={loginWithGoogle}
      className="!bg-white/5 hover:!bg-white/15 !border-white/20"
    >
      Continue with Google
    </Button>
  );
}

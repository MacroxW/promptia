import { useAuth } from "~/hooks/useAuth";
import { LoginForm } from "../components/LoginForm";

const LoginPage = () => {
    const { login, isLoading } = useAuth();

    return (
        <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <LoginForm onSubmit={login} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default LoginPage;

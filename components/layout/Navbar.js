import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import CartIcon from '../cart/CartIcon';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <a className="text-xl font-bold">書籍商城</a>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/products">
              <a className="hover:text-gray-600">商品列表</a>
            </Link>
            
            {user ? (
              <>
                <CartIcon />
                <div className="relative group">
                  <button className="hover:text-gray-600">
                    {user.name}
                  </button>
                  <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl hidden group-hover:block">
                    <Link href="/orders">
                      <a className="block px-4 py-2 text-sm hover:bg-gray-100">
                        訂單記錄
                      </a>
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      登出
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="hover:text-gray-600">登入</a>
                </Link>
                <Link href="/register">
                  <a className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                    註冊
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
import React from 'react'
import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import GetListProduct from './components/admin/GetListProduct'
import PostAddProduct from './components/admin/PostAddProduct'
import PutEditProduct from './components/admin/PutEditProduct'
import GetProductDetail from './components/admin/GetProductDetail'

import Register from './components/admin/Register'
import Login from './components/admin/Login'
import GetListCategory from './components/admin/GetListCategory'
import PostAddCategory from './components/admin/PostAddCategory'
import PutEditCategory from './components/admin/PutEditCategory'
import CommentAdmin from './components/admin/CommentList'
import CommentAdd from './components/admin/CommentAdd'
import ContactAdd from './components/admin/Contact/ContactAdd'
import ContactList from './components/admin/Contact/ContactList'
import OrderDetail from './components/admin/Order/OrderDetail'
import OrderList from './components/admin/Order/ListOrder'
import AddOrder from './components/admin/Order/AddOrder'
import BannerList from './components/admin/BannerList'
import BannerAdd from './components/admin/BannerAdd'
import BannerEdit from './components/admin/BannerEdit'
import BannerDetail from './components/admin/BannerDetail'
import VariantList from './components/admin/VariantList'
import VariantAdd from './components/admin/VariantAdd'
import VariantCustomAdd from './components/admin/VariantCustomAdd'
import LoginAdmin from './components/admin/User/Login'
import RegisterAdmin from './components/admin/User/Register'
import PrivateRouteAdmin from './components/PrivateRouteAdmin'
// import Books from './components/test/books'
// import AddBook from './components/test/books'


type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([

    {
      path: "/", element: <ClientLayout />, children: [

        //Router Đăng ký, Đăng nhập
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },


      ]
    },
     {
      path: "/admin/login",
      element: <LoginAdmin />,
    },
    {
      path: "/admin/register",
      element: <RegisterAdmin />,
    },
    {
      path: "/admin", element: 
      (<PrivateRouteAdmin>
        <AdminLayout />
      </PrivateRouteAdmin>)
      , children: [

        //Router Danh mục
        { path: 'category/list', element: <GetListCategory /> },
        { path: 'category/add', element: <PostAddCategory /> },
        { path: 'category/:id/edit', element: <PutEditCategory /> },
        {
          path: 'variant/list',
          element: <VariantList />,
        },
        {
          path: 'variant/custom-add',
          element: <VariantCustomAdd />,
        },
        {
          path: 'variant/add',
          element: <VariantAdd />,
        },

        //Router Sản phẩm
        { path: 'phone/list', element: <GetListProduct /> },
        { path: 'phone/add', element: <PostAddProduct /> },
        { path: 'phone/:id/edit', element: <PutEditProduct /> },
        { path: 'phone/:id', element: <GetProductDetail /> },



        //Router bình luận  
        { path: 'comment/list', element: <CommentAdmin /> },
        { path: 'comment/add', element: <CommentAdd /> },
        // {path:'login',element:<Login/>},


      //Router liên hệ
      {path:"contacts", element:<ContactList />},
      {path:'contacts/add', element:<ContactAdd />},
      


        //admin
        { path: "orders/add", element: <AddOrder /> },
        { path: "orders", element: <OrderList /> },
        { path: "orders/:id", element: <OrderDetail /> },
        // router banner
        { path: 'banner/list', element: <BannerList /> },
        { path: 'banner/add', element: <BannerAdd /> },
        { path: 'banner/:id/edit', element: <BannerEdit /> },
        { path: 'banner/:id', element: <BannerDetail /> },
      ]
    },




    {
      path: "/", element: <AdminLayout />, children: [

      ]
    },
  ])
  return routes
}

export default App
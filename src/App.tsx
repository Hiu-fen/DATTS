import React from 'react'
import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import GetListProduct from './components/admin/Product/GetListProduct'
import PostAddProduct from './components/admin/Product/PostAddProduct'
import PutEditProduct from './components/admin/Product/PutEditProduct'
import GetProductDetail from './components/admin/Product/GetProductDetail'

import Register from './components/client/UserClient/Register'
import Login from './components/client/UserClient/Login'
import GetListCategory from './components/admin/Category/GetListCategory'
import PostAddCategory from './components/admin/Category/PostAddCategory'
import PutEditCategory from './components/admin/Category/PutEditCategory'
import CommentAdmin from './components/admin/Comment/CommentList'
import CommentAdd from './components/admin/Comment/CommentAdd'
import ContactList from './components/admin/Contact/ContactList'
import OrderDetail from './components/admin/Order/OrderDetail'
import OrderList from './components/admin/Order/ListOrder'
import AddOrder from './components/admin/Order/AddOrder'
import BannerList from './components/admin/Banner/BannerList'
import BannerAdd from './components/admin/Banner/BannerAdd'
import BannerEdit from './components/admin/Banner/BannerEdit'
import BannerDetail from './components/admin/Banner/BannerDetail'
import VariantPage from './components/admin/Variant/VariantList'

import VariantAdd from './components/admin/Variant/VariantAdd'
import VariantCustomAdd from './components/admin/Variant/VariantCustomAdd'

import LoginAdmin from './components/admin/User/Login'
import RegisterAdmin from './components/admin/User/Register'
import PrivateRouteAdmin from './components/PrivateRouteAdmin'

import Home from './components/client/page/home'
import About from './components/client/page/about'
import ProductPage from './components/client/page/product'
import Details from './components/client/page/details'
import NewsClient from './components/client/page/news'
// import Contact from './components/client/page/contact'
import ContactPage from './components/client/page/contact'
import Cart from './components/client/page/cart'


import NewsAdd from './components/admin/News/NewsAdd'
import NewsEdit from './components/admin/News/NewsEdit'
import NewsAdmin from './components/admin/News/NewsList'
// import Books from './components/test/books'
// import AddBook from './components/test/books'

import PromotionList from './components/admin/Promotion/PromotionList'
import PromotionAdd from './components/admin/Promotion/PromotionAdd'
import PromotionEdit from './components/admin/Promotion/PromotionEdit'
import NewsDetail from './components/client/page/NewsDetail'
import Checkout from './components/client/page/checkoutCart'
import DetailOrders from './components/client/page/orderDetailClient'
import OrderHistory from './components/client/page/history'


type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([

    {
      path: "/", element: <ClientLayout />, children: [
        { path: '/', element: <Home /> },
        { path: '/about', element: <About /> },
        { path: '/product', element: <ProductPage /> },
        { path: '/product/:id', element: <Details /> },
        { path: '/news', element: <NewsClient /> },
        { path: '/news/:id', element: <NewsDetail /> },

        { path: '/call', element: <ContactPage /> },
        { path: '/carts', element: <Cart /> },
        { path: '/checkout', element: <Checkout /> },
        { path: '/history', element: <OrderHistory /> },
        { path: '/detail_order/:id', element: <DetailOrders /> },

        


        //Router Đăng ký, Đăng nhậpCon
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
          element: <VariantPage />,
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
      
      //Router bình luận  
      {path:'comment/list',element:<CommentAdmin/>},
      {path:'comment/add',element:<CommentAdd/>},
      // {path:'login',element:<Login/>},

      //Route tin tức
      {path:'news/list',element:<NewsAdmin/>},
      {path:'news/add',element:<NewsAdd/>},
      {path:'news/edit/:id',element:<NewsEdit/>},


      //Router liên hệ
      {path:"contacts", element:<ContactList />},
      
      // Khuyến mãi
      { path: 'promotion/list', element: <PromotionList /> },
      { path: 'promotion/add', element: <PromotionAdd /> },
      { path: 'promotion/:id/edit', element: <PromotionEdit /> },

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
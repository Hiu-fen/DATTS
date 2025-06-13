import React from 'react'
import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import GetList from './components/admin/GetList'
import PostAdd from './components/admin/PostAdd'
import PutEdit from './components/admin/PutEdit'
import Register from './components/admin/Register'
import Login from './components/admin/Login'
import GetListCategory from './components/admin/GetListCategory'
import PostAddCategory from './components/admin/PostAddCategory'
import PutEditCategory from './components/admin/PutEditCategory'
import CommentAdmin from './components/admin/CommentList'
import CommentAdd from './components/admin/CommentAdd'
// import Books from './components/test/books'
import AddBook from './components/test/books'


type Props = {}

const App = (props: Props) => {
  const routes = useRoutes([

      {path:"/client",element:<ClientLayout/>,children:[
        
      //Router Đăng ký, Đăng nhập
      {path:'login', element:<Login/>},
      {path:'register', element:<Register/>},


      ]},
      {path:"/admin",element:<AdminLayout/>,children:[

      //Router Danh mục
      {path:'category/list',element:<GetListCategory/>},
      {path:'category/add',element:<PostAddCategory/>},
      {path:'category/:id/edit',element:<PutEditCategory/>},

      //Router Sản phẩm
      {path:'phone/list',element:<GetList/>},
      {path:'phone/add',element:<PostAdd/>}, 
      {path:'phone/:id/edit',element:<PutEdit/>},
      
      //Router bình luận  
      {path:'comment/list',element:<CommentAdmin/>},
      {path:'comment/add',element:<CommentAdd/>},
      // {path:'login',element:<Login/>},

      {path:'books',element:<AddBook/>},
        

      ]},
      
      


      {path:"/",element:<AdminLayout/>,children:[
     
      ]},
  ])
  return routes
}

export default App
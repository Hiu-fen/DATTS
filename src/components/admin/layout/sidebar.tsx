import {
  CiOutlined,
  DashboardFilled,
  FileTextFilled,
  HighlightFilled,
  ProductFilled,
  ReadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  type MenuItem = Required<MenuProps>['items'][number];
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardFilled />,
    },
    {
      key: 'product-manage',
      label: 'Quản lý sản phẩm',
      icon: <ProductFilled />,
      children: [
        { key: 'product-list', label: 'Danh sách sản phẩm' },
        { key: 'product-add', label: 'Thêm sản phẩm' },
      ],
    },
    {
      key: 'category-manage',
      label: 'Quản lý danh mục',
      icon: <HighlightFilled />,
      children: [
        { key: 'category-list', label: 'Danh mục' },
        { key: 'category-add', label: 'Thêm danh mục' },
      ],
    },
    {
      key: 'variant-manage',
      label: 'Quản lý biến thể',
      icon: <ReadOutlined />,
      children: [
        { key: 'variant-list', label: 'Danh sách biến thể' },
        
      ],
    },
    {
      key: 'oders-manage',
      label: 'Quản lý đơn hàng',
      icon: <HighlightFilled />,
      children: [
        { key: 'orders', label: 'Oders' },
        { key: 'orders/add', label: 'test add order' },
        // { key: 'category-add', label: 'Thêm danh mục' },
      ],
    },
    {
      key: 'comment-manage',
      label: 'Quản lý bình luận',
      icon: <ReadOutlined />,
      children: [
        { key: 'comment-list', label: 'Bình luận' },
        { key: 'comment-add', label: 'Thêm bình luận' },
      ],
    },



     {
      key: 'contact-manage',
      label: 'Quản lý liên hệ',
      icon: <ReadOutlined />,
      children: [
        { key: 'contact-list', label: 'Liên hệ' },
      ],
      },
      {
      key: 'news-manage',
      label: 'Tin tức',
      icon: <ReadOutlined />,
      children: [
        { key: 'news-list', label: 'Danh sách' },
        { key: 'news-add', label: 'Thêm mới' },
      ],
    },
      {
      key: 'banner-manage',
      label: 'Quản lý banner',
      icon: <ReadOutlined />,
      children: [
        { key: 'banner-list', label: 'Banner' },
        { key: 'banner-add', label: 'Thêm banner' },
      ],
      },
      {
        key: 'promotion-manage',
        label: 'Quản lý khuyến mãi',
        icon: <ReadOutlined />,
        children: [
          { key: 'promotion-list', label: 'Danh sách khuyến mãi' },
          { key: 'promotion-add', label: 'Thêm khuyến mãi' }
        ],
      },
    {
      key: 'report',
      label: 'Thống kê',
      icon: <FileTextFilled />,
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const routeMap: Record<string, string> = {
      'product-list': '/admin/phone/list',
      'product-add': '/admin/phone/add',
      'category-list': '/admin/category/list',
      'category-add': '/admin/category/add',
      'variant-list': '/admin/variant/list',
      'variant-add': '/admin/variant/add',
      'variant-custom-add': '/admin/variant/custom-add',
      'comment-list': '/admin/comment/list',
      'comment-add': '/admin/comment/add',
      'news-list': '/admin/news/list',
      'news-add': '/admin/news/add',
      'contact-list': '/admin/contacts',
      'orders': '/admin/orders',
      'orders/add': '/admin/orders/add',
      'banner-list': '/admin/banner/list',
      'banner-add': '/admin/banner/add',
      'promotion-list': '/admin/promotion/list',
      'promotion-add': '/admin/promotion/add',
      dashboard: '/admin',
      report: '/admin/report',
    };

    if (routeMap[key]) {
      navigate(routeMap[key]);
    }
  };

  return (
    <div className="w-1/5 h-screen bg-white">
      <Menu
        onClick={onClick}
        style={{ width: '100%' }}
        defaultSelectedKeys={['dashboard']}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default AdminSidebar;

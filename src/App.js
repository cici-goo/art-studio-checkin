import React, { useState } from 'react';
import { Layout, Menu, App as AntApp, ConfigProvider } from 'antd';
import StudentManagement from './components/StudentManagement';
import ClassManagement from './components/ClassManagement';
import 'antd/dist/reset.css';
import './App.css';
import logoIcon from './assets/logo-icon.png';
import logoText1 from './assets/logo-text1.png';
import logoText2 from './assets/logo-text2.png';

const { Header, Content } = Layout;

function App() {
  const [currentTab, setCurrentTab] = useState('1');

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#eb86e1',
          borderRadius: 6,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f5f5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          colorLink: '#eb86e1',
          colorLinkHover: '#f3a6ec',
          colorPrimaryHover: '#f3a6ec',
          colorPrimaryActive: '#d665cc',
        },
      }}
    >
      <AntApp>
        <Layout className="layout">
          <Header className="header">
            <div className="logo left">
              <img src={logoIcon} alt="logo icon" />
            </div>
            <Menu
              className="nav-menu"
              mode="horizontal"
              selectedKeys={[currentTab]}
              onClick={e => setCurrentTab(e.key)}
              items={[
                { key: '1', label: '学生管理' },
                { key: '2', label: '班级管理' },
              ]}
            />
            <div className="logo-group">
              <img src={logoIcon} alt="logo icon" className="logo-part" />
              <img src={logoText1} alt="logo text 1" className="logo-part" />
              <img src={logoText2} alt="logo text 2" className="logo-part" />
            </div>
          </Header>
          <Content className="content">
            {currentTab === '1' ? <StudentManagement /> : <ClassManagement />}
          </Content>
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

export default App; 
import React, { useState } from 'react'
import { Layout, Menu } from 'antd'
import {
	RiseOutlined,
	HomeOutlined,
	FlagOutlined,
	TeamOutlined,
	SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import SubMenu from 'antd/lib/menu/SubMenu'
import styled from 'styled-components'
import useWindowSize from '../../utils/common/use-window-size'
import useMyRoute from '../../utils/common/ues-my-route'

const { Sider } = Layout
const { Item } = Menu

interface SiderProps {}

const keyMap: any = {
	'/schedule/calendar': '/schedule/calendar',
	'/schedule/manager': '/schedule/manager',
}



const SiderDashboard: React.FC<SiderProps> = () => {
	const [collapsed, setCollapsed] = useState(false)
	const { width } = useWindowSize()
	const { isPopUpRoute, pathname } = useMyRoute()
	const navigate = useNavigate()
	const redirect = ({ key }: any) => {
		navigate(key)
	}
	const onCollapse = (value: boolean) => {
		console.log(value)
		setCollapsed(value)
	}


	return (
		<div style={{ position: 'relative', background: '#fbfbff' }}>
			{isPopUpRoute && <OverlayDiv />}

			<SiderStyled
				collapsible={!isPopUpRoute}
				onCollapse={onCollapse}
				collapsedWidth={45}
				width={255}
				style={{ background: '#fbfbff' }}
				collapsed={width < 768 ? true : collapsed}
				checkWidth={width}
			>
				{!collapsed && width > 768 ? (
					<div style={{ margin: '20px 16px' }}>
						<Link to='/'>
							<img src='/img/lynkid.svg' alt='lynkid' />
						</Link>
					</div>
				) : (
					<div style={{ margin: '20px 8px' }}>
						<Link to='/'>
							<img src='/img/id-logo.svg' alt='lynkid' />
						</Link>
					</div>
				)}
				<MenuStyled
					onClick={redirect}
					selectedKeys={
						keyMap[pathname]
							? keyMap[pathname]
							: '/dashboard'
					}
					mode='inline'
					defaultOpenKeys={['schedule']}
				>
					<ItemStyled key='/dashboard' icon={<HomeOutlined />}>
						Dashboard
					</ItemStyled>


					<SubMenuStyled key='schedule' title='Schedule' icon={<RiseOutlined />} >
						<Item key='/schedule/calendar'>
							<span>Calendar</span>
						</Item>
						<Item key='/schedule/manager'>
							<span>Manager</span>
						</Item>
					</SubMenuStyled>

				</MenuStyled>
			</SiderStyled>
		</div>
	)
}

export default SiderDashboard

const OverlayDiv = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1;
`

const SiderStyled = styled(Sider)<any>`
	height: calc(100vh - 0px);
	background: #fbfbff;
	overflow-y: auto;
	.ant-layout-sider-trigger {
		background: #fbfbff;
		color: #3b82f6;
		visibility: ${props => (props.checkWidth > 768 ? 'visible' : 'hidden')};
	}
`

const MenuStyled = styled(Menu)`
	/* height: calc(100vh - 0px); */
	background: #fbfbff;
	/* overflow-x: hidden; */
	.ant-menu-item::after {
		border-right: none;
	}

	.ant-menu-submenu-title {
		padding-left: 11px !important;
	}
	.ant-menu-submenu-selected {
		/* background: #3B82F6 !important; */
		/* color: #ffffff !important; */
	}

	[aria-expanded='true'] {
	}

	&.ant-menu-inline {
		padding-left: 8px !important;
		padding-right: 8px;
	}
	&.ant-layout-sider-has-trigger, &.ant-layout-sider-has-trigger {
		/* padding-bottom: 1000px !important; */
	}
	&.ant-menu-inline,
	&.ant-menu-vertical,
	&.ant-menu-vertical-left {
		border-right: none;
	}
`

const SubMenuStyled = styled(SubMenu)`
	&.ant-menu-item {
		padding-left: 24px !important;
	}

	.ant-menu-item-selected {
		background: #3b82f6 !important;
		color: #ffffff;
		border-right: none;
		&:hover {
			color: #ffffff;
		}
		border-radius: 6px;
	}

	.ant-menu-sub.ant-menu-inline {
		background: #fbfbff;
	}
`

const ItemStyled = styled(Item)`
	&.ant-menu-item-selected {
		background: #3b82f6 !important;
		color: #ffffff;
		border-right: none;
		&:hover {
			color: #ffffff;
		}
		border-radius: 6px;
	}

	&.ant-menu-item {
		padding-left: 11px !important;
	}
`

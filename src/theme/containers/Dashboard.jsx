import { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router';
import Header from '../sections/Header';
import Nav from '../sections/Nav';
import Footer from '../sections/Footer';
import Loader from '../../components/loaders/Loader';

const Dashboard = () => {
	const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const outletContext = useOutletContext();

	useEffect(() => {
		document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
		return () => {
			document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary', 'sidebar-collapse', 'sidebar-open');
		};
	}, []);

	const handleCloseSidebar = () => {
		if (window.innerWidth < 992) {
			document.body.classList.remove('sidebar-open');
			setSidebarOpenMobile(false);
			setSidebarCollapsed(false);
		}
	};

	const handleToggleSidebar = () => {
		if (window.innerWidth < 992) {
			setSidebarOpenMobile((prev) => {
				const nextState = !prev;
				document.body.classList.toggle('sidebar-open', nextState);
				document.body.classList.remove('sidebar-collapse');
				return nextState;
			});
		} else {
			setSidebarCollapsed((prev) => {
				const nextState = !prev;
				document.body.classList.toggle('sidebar-collapse', nextState);
				document.body.classList.remove('sidebar-open');
				return nextState;
			});
		}
	};

	return (
		<>
			<div className="app-wrapper">
				<Header onToggleSidebar={handleToggleSidebar} />
				<Nav me={outletContext?.me} onCloseSidebar={handleCloseSidebar} />
				{sidebarOpenMobile && (
					<div
						className="sidebar-overlay d-lg-none"
						onClick={handleCloseSidebar}
						style={{
							position: 'fixed',
							inset: 0,
							backgroundColor: 'rgba(0, 0, 0, 0.35)',
							zIndex: 1037,
						}}
						aria-hidden="true"
					/>
				)}
				<main className="app-main">
					<Outlet context={outletContext} />
				</main>
				<Footer />
			</div>
			<Loader />
		</>
	);
};

export default Dashboard;
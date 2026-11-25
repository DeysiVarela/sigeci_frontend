import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { logout } from "../../api/auth";
import { AppContext } from "../../context/AppContext";
import LanguageSelector from "../../components/multilanguage/LanguageSelector";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-gratis/establecimiento-circulos-usuarios_78370-4704.jpg";

const ROLE_FALLBACK_BY_ID = {
	1: { key: "admin", es: "Administrador", en: "Administrator" },
	2: { key: "member", es: "Miembro", en: "Member" },
	3: { key: "author", es: "Autor", en: "Author" },
	4: { key: "evaluator", es: "Evaluador", en: "Evaluator" }
};

const Header = ({ onToggleSidebar, me }) => {

	const { t, i18n } = useTranslation();
	const { app } = useContext(AppContext);

	const fullName = [me?.name, me?.lastname].filter(Boolean).join(" ").trim()
		|| me?.full_name
		|| app?.name
		|| me?.email
		|| app?.email
		|| t("userMenu.demoUser");

	const firstName = (me?.name || app?.name || fullName).trim().split(/\s+/)[0];

	const rawRole = (Array.isArray(me?.roles) && me.roles.length > 0
		? (typeof me.roles[0] === "object" ? (me.roles[0]?.name || me.roles[0]?.role_name || me.roles[0]?.id) : me.roles[0])
		: null)
		?? me?.role
		?? me?.profile
		?? app?.profile
		?? "";

	const numericRoleId = Number(rawRole);
	const roleConfig = !Number.isNaN(numericRoleId) ? ROLE_FALLBACK_BY_ID[numericRoleId] : null;
	const lang = i18n.language?.startsWith("en") ? "en" : "es";

	const roleName = roleConfig
		? t(`userMenu.roles.${roleConfig.key}`, { defaultValue: roleConfig[lang] })
		: String(rawRole || "").trim();

	const avatarUrl = me?.photo || me?.image || app?.image || DEFAULT_AVATAR;

	const rawCreatedAt = me?.created_at || me?.createdAt || me?.date_joined;
	const memberSinceDate = rawCreatedAt && !Number.isNaN(new Date(rawCreatedAt).getTime())
		? new Date(rawCreatedAt).toLocaleDateString(i18n.language)
		: null;

	return (
		<nav className="app-header navbar navbar-expand bg-body">
			<div className="container-fluid pe-4">
				{/* Start Navbar Links */}
				<ul className="navbar-nav">
					<li className="nav-item">
						<button
							className="nav-link btn btn-link"
							type="button"
							onClick={onToggleSidebar}
							aria-label="Toggle sidebar"
						>
							<i className="bi bi-list fs-4"></i>
						</button>
					</li>
				</ul>

				{/* End Navbar Links */}
				<ul className="navbar-nav ms-auto me-3 align-items-center">

					{/* Notifications Dropdown */}
					<li className="nav-item dropdown">
						<a
							className="nav-link"
							data-bs-toggle="dropdown"
							href="#"
							aria-label="Notifications: 15 unread"
						>
							<i className="bi bi-bell-fill"></i>
							<span className="navbar-badge badge text-bg-warning">15</span>
						</a>
						<div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
							<span className="dropdown-item dropdown-header">15 Notifications</span>
							<div className="dropdown-divider"></div>
							<a href="#" className="dropdown-item">
								<i className="bi bi-envelope me-2"></i> 4 new messages
								<span className="float-end text-secondary fs-7">3 mins</span>
							</a>
							<div className="dropdown-divider"></div>
							<a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
						</div>
					</li>

					{/* Language Menu */}
					<li className="nav-item">
						<LanguageSelector />
					</li>

					{/* User Menu Dropdown */}
					<li className="nav-item dropdown user-menu">
						<a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" title={fullName}>
							<img
								src={avatarUrl}
								className="user-image rounded-circle shadow"
								alt={fullName}
								style={{ width: '35px', height: '35px', objectFit: 'cover' }}
							/>
							<span className="d-none d-xl-inline">{firstName}</span>
						</a>
						<ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
							<li className="user-header text-bg-primary">
								<img
									src={avatarUrl}
									className="rounded-circle shadow"
									alt={fullName}
									style={{ width: '45px', height: '45px', objectFit: 'cover', display: "block", marginLeft: "auto", marginRight: "auto" }}
								/>
								<p>
									{roleName ? `${fullName} - ${roleName}` : fullName}
									{memberSinceDate && (
										<small>{t("userMenu.memberSince", { date: memberSinceDate })}</small>
									)}
								</p>
							</li>
							<li className="user-footer">
								<Link to="/profile" className="btn btn-outline-secondary">{t("userMenu.profile")}</Link>
								<button type="button" className="btn btn-outline-danger float-end" onClick={async () => { await logout(); window.location.href = "/login"; }}>{t("userMenu.logout")}</button>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Header;
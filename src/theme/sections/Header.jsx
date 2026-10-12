const Header = ({ onToggleSidebar }) => {
  return (
    <nav className="app-header navbar navbar-expand bg-body">
      <div className="container-fluid">
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
        <ul className="navbar-nav ms-auto">

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
          <li className="nav-item dropdown">
            <a
              className="nav-link"
              href="#"
              id="language-menu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Change language"
            >
              <i className="bi bi-translate" aria-hidden="true"></i>
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="language-menu">
              <li>
                <a className="dropdown-item active" href="#">
                  English <i className="bi bi-check-lg ms-2" aria-hidden="true"></i>
                </a>
              </li>
              <li><a className="dropdown-item" href="#">Español</a></li>
            </ul>
          </li>

          {/* User Menu Dropdown */}
          <li className="nav-item dropdown user-menu">
            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
              <img
                src="/src/pages/templates/assets/img/user2-160x160.jpg"
                className="user-image rounded-circle shadow"
                alt="Alexander Pierce"
                style={{ width: '35px', height: '35px' }}
              />
              <span className="d-none d-xl-inline">Alexander Pierce</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
              <li className="user-header text-bg-primary">
                <img
                    src="/src/pages/templates/assets/img/user2-160x160.jpg"
                    className="rounded-circle shadow"
                    alt="Alexander Pierce"
                    style={{ width: '45px', height: '45px', display: "block", marginLeft: "auto", marginRight: "auto" }}
                />
                <p>
                  Alexander Pierce - Web Developer
                  <small>Member since Nov. 2023</small>
                </p>
              </li>
              <li className="user-footer">
                <a href="#" className="btn btn-outline-secondary">Profile</a>
                <a href="#" className="btn btn-outline-danger float-end">Sign out</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
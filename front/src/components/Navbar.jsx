import { Calendar, User, List, BookOpen } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onTheoryClick, onUsersClick, onHomeClick, onCalendarClick }) => {
  const handleListClick = () => {
    console.log('List clicked');
  };

  return (
    <nav className="navbar">
      <div className="navbar-icons">
        <button onClick={onCalendarClick} className="icon-button" aria-label="Calendar">
          <Calendar size={24} />
        </button>
        <button onClick={onUsersClick} className="icon-button" aria-label="User">
          <User size={24} />
        </button>
        <button onClick={onTheoryClick} className="icon-button" aria-label="Theory">
          <BookOpen size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
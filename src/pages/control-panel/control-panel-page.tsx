import ControlPanel from './components/ControlPanel';
import ControlPanelPopup from './popups/ControlPanelPopup';

const ControlPanelPage = () => {
  return (
    <div className="card">
      <ControlPanel />
      <ControlPanelPopup />
    </div>
  );
};

export default ControlPanelPage;

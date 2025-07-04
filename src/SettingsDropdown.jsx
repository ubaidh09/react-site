import {
  Flag,
  PenLine,
  Clipboard,
  Copy,
  Trash2
} from 'lucide-react';

import './SettingsDropdown.css';

function SettingsDropdown({
  onSetFirst,
  onRename,
  onCopy,
  onDuplicate,
  onDelete
}) {
  return (
    <div
  className="dropdown"
  onClick={(e) => e.stopPropagation()}
  onPointerDown={(e) => e.stopPropagation()} 
>

      <div className="dropdown-header">Settings</div>

      <div className="dropdown-item" onClick={onSetFirst}>
        <Flag size={16} style={{ color: '#2563eb', fill: '#2563eb' }} />
        <span>Set as first page</span>
      </div>

      <div className="dropdown-item" onClick={onRename}>
        <PenLine size={16} color="#9ca3af"/>
        <span>Rename</span>
      </div>

      <div className="dropdown-item" onClick={onCopy}>
        <Clipboard size={16} color="#9ca3af"/>
        <span>Copy</span>
      </div>

      <div className="dropdown-item" onClick={onDuplicate}>
        <Copy size={16} color="#9ca3af" />
        <span>Duplicate</span>
      </div>

      <div className="dropdown-separator" />

      <div className="dropdown-item delete" onClick={onDelete}>
        <Trash2 size={16} color="#ef4444" strokeWidth={1.5} />        <span>Delete</span>
      </div>
    </div>
  );
}

export default SettingsDropdown;

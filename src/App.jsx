import { useState, useEffect } from 'react';
import './App.css';
import SettingsDropdown from './SettingsDropdown';
import { FaInfoCircle, FaFileAlt, FaCheckCircle } from 'react-icons/fa';

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function resolveIcon(name) {
  switch (name) {
    case 'Info': return <FaInfoCircle />;
    case 'file': return <FaFileAlt />;
    case 'check': return <FaCheckCircle />;
    default: return <FaFileAlt />;
  }
}

function getInitialPages() {
  const saved = localStorage.getItem('pages');
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.map(p => ({
      ...p,
      icon: resolveIcon(p.iconName),
      showSettings: false
    }));
  }

  return [
    { id: '1', name: 'Info', icon: <FaInfoCircle />, iconName: 'Info', color: '#f59e0b', showSettings: false },
    { id: '2', name: 'Details', icon: <FaFileAlt />, iconName: 'file', color: '#6b7280', showSettings: false },
    { id: '3', name: 'Other', icon: <FaFileAlt />, iconName: 'file', color: '#6b7280', showSettings: false },
    { id: '4', name: 'Ending', icon: <FaCheckCircle />, iconName: 'check', color: '#6b7280', showSettings: false }
  ];
}

function SortablePage({
  page,
  index,
  isActive,
  isFocused,
  setActivePageId,
  setFocusedPageId,
  toggleSettings,
  handleSetFirst,
  handleRename,
  renamingPageId,
  setRenamingPageId,
  handleSaveRename,
  handleCopy,
  copiedPageId,
  handleDuplicate,
  handleDelete,
  windowWidth
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative'
  };

  return (
    <div
      className="page-item-wrapper"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className={`page-button ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
        onClick={(e) => {
          if (!e.target.closest('.dropdown')) {
            setActivePageId(page.id);
          }
        }}
        onFocus={(e) => {
          if (!e.target.closest('.dropdown')) {
            setFocusedPageId(page.id);
          }
        }}
        tabIndex={0}
        style={{ position: 'relative' }}
      >
        {copiedPageId === page.id && (
          <div className="copied-toast">Copied!</div>
        )}

        <span className="icon-box">
          <span className={`icon ${isActive || isFocused ? 'icon-colored' : ''}`}>
            {page.icon}
          </span>
        </span>

        <span className={`label-box ${isActive ? 'label-border' : ''}`}>
          {renamingPageId === page.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newName = e.target.elements.renameInput.value.trim();
                if (newName) handleSaveRename(page.id, newName);
              }}
              className="rename-inline-form"
            >
              <input
                name="renameInput"
                defaultValue={page.name}
                autoFocus
                className="rename-inline-input"
              />
              <button type="submit" className="rename-inline-save">Save</button>
            </form>
          ) : (
            <span className={`label ${isActive || isFocused ? 'label-active' : ''}`}>
              {page.name}
            </span>
          )}
        </span>

        {(isActive || windowWidth <= 768) && (
          <div
            className="more-button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleSettings(page.id);
            }}
          >
            ⋮
          </div>
        )}
      </div>

      {page.showSettings && (
        <div className="dropdown-position">
          <SettingsDropdown
            onSetFirst={() => handleSetFirst(page.id)}
            onRename={() => handleRename(page.id)}
            onCopy={() => handleCopy(page.id)}
            onDuplicate={() => handleDuplicate(page.id)}
            onDelete={() => handleDelete(page.id)}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  const [pages, setPages] = useState(getInitialPages);
  const [activePageId, setActivePageId] = useState('1');
  const [focusedPageId, setFocusedPageId] = useState(null);
  const [renamingPageId, setRenamingPageId] = useState(null);
  const [deletingPageId, setDeletingPageId] = useState(null);
  const [copiedPageId, setCopiedPageId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const toSave = pages.map(({ icon, showSettings, ...rest }) => rest);
    localStorage.setItem('pages', JSON.stringify(toSave));
  }, [pages]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const isInside = e.target.closest('.dropdown') || e.target.closest('.more-button');
      if (!isInside) {
        setPages(prev => prev.map(p => ({ ...p, showSettings: false })));
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPages(prev => prev.map(p => ({ ...p, showSettings: false })));
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleSettings = (id) => {
    setPages(prev =>
      prev.map(p => ({
        ...p,
        showSettings: p.id === id ? !p.showSettings : false
      }))
    );
  };

  const handleSetFirst = (id) => {
    setPages((prev) => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const newOrder = [prev[idx], ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      return newOrder.map(p => ({ ...p, showSettings: false }));
    });
    setActivePageId(id);
  };

  const handleRename = (id) => {
    setRenamingPageId(id);
  };

  const handleSaveRename = (id, newName) => {
    setPages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, name: newName } : p
      )
    );
    setRenamingPageId(null);
  };

  const handleCopy = (id) => {
    const original = pages.find(p => p.id === id);
    if (!original) return;
    navigator.clipboard.writeText(original.name).then(() => {
      setCopiedPageId(id);
      setTimeout(() => setCopiedPageId(null), 1000);
    });
  };

  const handleDuplicate = (id) => {
    const original = pages.find(p => p.id === id);
    if (!original) return;
    const newPage = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} Copy`,
      icon: original.icon,
      iconName: original.iconName,
      showSettings: false
    };
    const idx = pages.findIndex(p => p.id === id);
    const newPages = [...pages];
    newPages.splice(idx + 1, 0, newPage);
    setPages(newPages);
  };

  const handleDelete = (id) => {
    setDeletingPageId(id); 
  };

  const confirmDelete = () => {
    setPages(prev => {
      const updated = prev.filter(p => p.id !== deletingPageId);
      if (deletingPageId === activePageId && updated.length > 0) {
        setActivePageId(updated[0].id);
      }
      return updated;
    });
    setDeletingPageId(null);
  };

  const cancelDelete = () => {
    setDeletingPageId(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pages.findIndex(p => p.id === active.id);
      const newIndex = pages.findIndex(p => p.id === over.id);
      setPages(items => arrayMove(items, oldIndex, newIndex));
    }
  };

  const addPageBetween = (index) => {
    const newPage = {
      id: Date.now().toString(),
      name: 'New Page',
      icon: <FaFileAlt />,
      iconName: 'file',
      color: '#6b7280',
      showSettings: false
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    setPages(newPages);
  };

  return (
    <>
      <div style={{ padding: windowWidth > 768 ? '30px' : '16px' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
            <div className="page-list">
              {pages.map((page, index) => {
                const isActive = page.id === activePageId;
                const isFocused = page.id === focusedPageId;

                return (
                  <div key={page.id} className="drag-wrapper">
                    <SortablePage
                      page={page}
                      index={index}
                      isActive={isActive}
                      isFocused={isFocused}
                      setActivePageId={setActivePageId}
                      setFocusedPageId={setFocusedPageId}
                      toggleSettings={toggleSettings}
                      handleSetFirst={handleSetFirst}
                      handleRename={handleRename}
                      renamingPageId={renamingPageId}
                      setRenamingPageId={setRenamingPageId}
                      handleSaveRename={handleSaveRename}
                      handleCopy={handleCopy}
                      handleDuplicate={handleDuplicate}
                      handleDelete={handleDelete}
                      copiedPageId={copiedPageId}
                      windowWidth={windowWidth}
                    />
                    {index < pages.length - 1 && windowWidth > 768 && (
                      <div className="connector-wrapper">
                        <div className="connector"></div>
                        <button className="small-plus" onClick={() => addPageBetween(index)}>+</button>
                        <div className="connector"></div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ marginLeft: windowWidth > 768 ? '16px' : '0', flex: windowWidth <= 768 ? '1 1 100%' : 'auto' }}>
                <button
                  className="add-button-final"
                  onClick={() => addPageBetween(pages.length - 1)}
                >
                  + Add page
                </button>
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {deletingPageId && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <p>Are you sure you want to delete this page?</p>
            <div className="modal-actions">
              <button className="delete-confirm" onClick={confirmDelete}>Yes, Delete</button>
              <button className="delete-cancel" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
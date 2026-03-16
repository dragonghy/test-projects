// === Markdown Notes App (M1 + M2) ===

(function () {
  'use strict';

  // --- Constants ---
  const STORAGE_KEY = 'markdown-notes';
  const SAVE_DEBOUNCE_MS = 500;

  // --- State ---
  let notes = [];
  let activeNoteId = null;
  let saveTimer = null;
  let searchQuery = '';
  let activeTagFilter = null;

  // --- DOM ---
  const noteListEl = document.getElementById('note-list');
  const editorEl = document.getElementById('editor');
  const previewEl = document.getElementById('preview-content');
  const lineNumbersEl = document.getElementById('line-numbers');
  const saveStatusEl = document.getElementById('save-status');
  const wordCountEl = document.getElementById('word-count');
  const btnNew = document.getElementById('btn-new');
  const sidebarEl = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const viewToggle = document.getElementById('view-toggle');
  const previewPane = document.getElementById('preview-pane');
  const searchBox = document.getElementById('search-box');
  const tagFilterEl = document.getElementById('tag-filter');
  const tagBarEl = document.getElementById('tag-bar');
  const toolbarEl = document.getElementById('toolbar');
  const btnImport = document.getElementById('btn-import');
  const btnBackup = document.getElementById('btn-backup');
  const btnRestore = document.getElementById('btn-restore');
  const fileImportEl = document.getElementById('file-import');
  const fileRestoreEl = document.getElementById('file-restore');

  // --- Markdown Setup ---
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  // --- Storage ---
  function loadNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function showSaveStatus() {
    saveStatusEl.innerHTML = '<span class="saved">已保存</span>';
    setTimeout(() => {
      saveStatusEl.textContent = '';
    }, 2000);
  }

  // --- Note Operations ---
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function createNote(title, content, tags) {
    const now = Date.now();
    const note = {
      id: generateId(),
      title: title || '未命名笔记',
      content: content || '',
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };
    notes.unshift(note);
    saveNotes();
    return note;
  }

  function getActiveNote() {
    return notes.find(n => n.id === activeNoteId) || null;
  }

  function selectNote(id) {
    activeNoteId = id;
    const note = getActiveNote();
    if (note) {
      editorEl.value = note.content;
      renderPreview();
      updateLineNumbers();
      updateWordCount();
      renderTagBar();
    } else {
      editorEl.value = '';
      previewEl.innerHTML = '';
      updateLineNumbers();
      updateWordCount();
      renderTagBar();
    }
    renderNoteList();
  }

  function deleteNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (!confirm(`确定要删除笔记「${note.title}」吗？`)) return;

    notes = notes.filter(n => n.id !== id);
    saveNotes();

    if (activeNoteId === id) {
      const filtered = getFilteredNotes();
      activeNoteId = filtered.length > 0 ? filtered[0].id : (notes.length > 0 ? notes[0].id : null);
      const active = getActiveNote();
      editorEl.value = active ? active.content : '';
      renderPreview();
      updateLineNumbers();
      updateWordCount();
      renderTagBar();
    }
    renderNoteList();
    renderTagFilter();
  }

  function renameNote(id, newTitle) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.title = newTitle || '未命名笔记';
    note.updatedAt = Date.now();
    sortNotes();
    saveNotes();
    renderNoteList();
  }

  function sortNotes() {
    notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // --- F2.1: Search ---
  function getFilteredNotes() {
    let filtered = notes;

    // Tag filter
    if (activeTagFilter) {
      filtered = filtered.filter(n => n.tags && n.tags.includes(activeTagFilter));
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  searchBox.addEventListener('input', () => {
    searchQuery = searchBox.value.trim();
    renderNoteList();
  });

  // --- F2.2: Tags ---
  function getAllTags() {
    const tagSet = new Set();
    notes.forEach(n => {
      if (n.tags) n.tags.forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }

  function addTagToNote(noteId, tag) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    if (!note.tags) note.tags = [];
    tag = tag.trim();
    if (!tag || note.tags.includes(tag)) return;
    note.tags.push(tag);
    note.updatedAt = Date.now();
    sortNotes();
    saveNotes();
    renderTagBar();
    renderTagFilter();
    renderNoteList();
  }

  function removeTagFromNote(noteId, tag) {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.tags) return;
    note.tags = note.tags.filter(t => t !== tag);
    note.updatedAt = Date.now();
    sortNotes();
    saveNotes();
    renderTagBar();
    renderTagFilter();
    renderNoteList();
  }

  function renderTagFilter() {
    const allTags = getAllTags();
    tagFilterEl.innerHTML = '';
    if (allTags.length === 0) return;

    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag-filter-item' + (activeTagFilter === tag ? ' active' : '');
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        activeTagFilter = activeTagFilter === tag ? null : tag;
        renderTagFilter();
        renderNoteList();
      });
      tagFilterEl.appendChild(btn);
    });
  }

  function renderTagBar() {
    tagBarEl.innerHTML = '';
    const note = getActiveNote();
    if (!note) return;

    if (note.tags) {
      note.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.innerHTML = tag + ' <span class="tag-remove">&times;</span>';
        span.querySelector('.tag-remove').addEventListener('click', () => {
          removeTagFromNote(note.id, tag);
        });
        tagBarEl.appendChild(span);
      });
    }

    const input = document.createElement('input');
    input.className = 'tag-add-input';
    input.placeholder = '+ 标签';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTagToNote(note.id, input.value);
        input.value = '';
      }
    });
    tagBarEl.appendChild(input);
  }

  // --- Rendering ---
  function renderNoteList() {
    noteListEl.innerHTML = '';
    const filtered = getFilteredNotes();
    filtered.forEach(note => {
      const li = document.createElement('li');
      li.className = 'note-item' + (note.id === activeNoteId ? ' active' : '');

      const info = document.createElement('div');
      info.className = 'note-info';

      const title = document.createElement('input');
      title.className = 'note-title';
      title.type = 'text';
      title.value = note.title;
      title.readOnly = true;

      const date = document.createElement('div');
      date.className = 'note-date';
      date.textContent = formatDate(note.updatedAt);

      info.appendChild(title);
      info.appendChild(date);

      // Show tags in note list
      if (note.tags && note.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'note-tags';
        note.tags.forEach(tag => {
          const tagSpan = document.createElement('span');
          tagSpan.className = 'note-tag';
          tagSpan.textContent = tag;
          tagsDiv.appendChild(tagSpan);
        });
        info.appendChild(tagsDiv);
      }

      const btnDel = document.createElement('button');
      btnDel.className = 'btn-delete';
      btnDel.innerHTML = '&times;';
      btnDel.title = '删除笔记';

      li.appendChild(info);
      li.appendChild(btnDel);

      // Click to select
      li.addEventListener('click', (e) => {
        if (e.target === btnDel || e.target === title) return;
        if (activeNoteId === note.id) return;
        selectNote(note.id);
        closeSidebarOnMobile();
      });

      // Double-click to rename
      title.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        title.readOnly = false;
        title.classList.add('editing');
        title.focus();
        title.select();
      });

      title.addEventListener('blur', () => {
        title.readOnly = true;
        title.classList.remove('editing');
        renameNote(note.id, title.value.trim());
      });

      title.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          title.blur();
        }
        if (e.key === 'Escape') {
          title.value = note.title;
          title.blur();
        }
      });

      title.addEventListener('click', (e) => {
        if (!title.readOnly) {
          e.stopPropagation();
        } else if (activeNoteId !== note.id) {
          selectNote(note.id);
          closeSidebarOnMobile();
        }
      });

      // Delete
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(note.id);
      });

      noteListEl.appendChild(li);
    });
  }

  function renderPreview() {
    const note = getActiveNote();
    if (note) {
      previewEl.innerHTML = marked.parse(note.content);
    } else {
      previewEl.innerHTML = '<p style="color: var(--text-muted);">选择或创建一个笔记开始编辑</p>';
    }
  }

  function updateLineNumbers() {
    const text = editorEl.value;
    const lineCount = text.split('\n').length;
    const lines = [];
    for (let i = 1; i <= lineCount; i++) {
      lines.push(i);
    }
    lineNumbersEl.textContent = lines.join('\n');
  }

  // --- F2.4: Word Count ---
  function updateWordCount() {
    const text = editorEl.value;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    // Count words: split by whitespace, filter empty
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCountEl.textContent = `${chars} 字符 | ${words} 单词 | ${lines} 行`;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // --- Editor Events ---
  editorEl.addEventListener('input', () => {
    const note = getActiveNote();
    if (!note) return;

    note.content = editorEl.value;
    note.updatedAt = Date.now();
    renderPreview();
    updateLineNumbers();
    updateWordCount();
    sortNotes();
    renderNoteList();

    // Debounced save
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveNotes();
      showSaveStatus();
    }, SAVE_DEBOUNCE_MS);
  });

  // Sync line numbers scroll
  editorEl.addEventListener('scroll', () => {
    lineNumbersEl.scrollTop = editorEl.scrollTop;
  });

  // --- New Note ---
  btnNew.addEventListener('click', () => {
    const note = createNote();
    selectNote(note.id);
    editorEl.focus();
  });

  // --- F2.3: Toolbar ---
  function insertAtCursor(before, after) {
    const start = editorEl.selectionStart;
    const end = editorEl.selectionEnd;
    const text = editorEl.value;
    const selected = text.substring(start, end);

    after = after || '';
    const insertion = before + selected + after;
    editorEl.value = text.substring(0, start) + insertion + text.substring(end);

    // Place cursor after inserted text or select the placeholder
    if (selected) {
      editorEl.selectionStart = start;
      editorEl.selectionEnd = start + insertion.length;
    } else {
      editorEl.selectionStart = start + before.length;
      editorEl.selectionEnd = start + before.length;
    }
    editorEl.focus();
    editorEl.dispatchEvent(new Event('input'));
  }

  function insertAtLineStart(prefix) {
    const start = editorEl.selectionStart;
    const text = editorEl.value;
    // Find start of current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    editorEl.value = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    editorEl.selectionStart = start + prefix.length;
    editorEl.selectionEnd = start + prefix.length;
    editorEl.focus();
    editorEl.dispatchEvent(new Event('input'));
  }

  toolbarEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tool-btn');
    if (!btn) return;
    const action = btn.dataset.action;
    if (!getActiveNote()) return;

    switch (action) {
      case 'bold':
        insertAtCursor('**', '**');
        break;
      case 'italic':
        insertAtCursor('*', '*');
        break;
      case 'h1':
        insertAtLineStart('# ');
        break;
      case 'h2':
        insertAtLineStart('## ');
        break;
      case 'h3':
        insertAtLineStart('### ');
        break;
      case 'link':
        insertAtCursor('[', '](url)');
        break;
      case 'code':
        if (editorEl.selectionStart !== editorEl.selectionEnd) {
          insertAtCursor('`', '`');
        } else {
          insertAtCursor('```\n', '\n```');
        }
        break;
      case 'ul':
        insertAtLineStart('- ');
        break;
      case 'ol':
        insertAtLineStart('1. ');
        break;
      case 'export':
        exportCurrentNote();
        break;
    }
  });

  // --- F2.5: Export Single Note ---
  function exportCurrentNote() {
    const note = getActiveNote();
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (note.title || 'note') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- F2.6: Import .md File ---
  btnImport.addEventListener('click', () => {
    fileImportEl.click();
  });

  fileImportEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const title = file.name.replace(/\.md$/i, '');
      const note = createNote(title, reader.result);
      selectNote(note.id);
      renderTagFilter();
    };
    reader.readAsText(file);
    fileImportEl.value = '';
  });

  // --- F2.7: Backup & Restore ---
  btnBackup.addEventListener('click', () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      notes: notes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-notes-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnRestore.addEventListener('click', () => {
    fileRestoreEl.click();
  });

  fileRestoreEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let imported;
        if (data.notes && Array.isArray(data.notes)) {
          imported = data.notes;
        } else if (Array.isArray(data)) {
          imported = data;
        } else {
          alert('无效的备份文件格式');
          return;
        }

        if (!confirm(`将导入 ${imported.length} 个笔记，这将覆盖当前所有笔记。确定继续？`)) return;

        notes = imported.map(n => ({
          id: n.id || generateId(),
          title: n.title || '未命名笔记',
          content: n.content || '',
          tags: n.tags || [],
          createdAt: n.createdAt || Date.now(),
          updatedAt: n.updatedAt || Date.now()
        }));
        sortNotes();
        saveNotes();
        activeNoteId = notes.length > 0 ? notes[0].id : null;
        selectNote(activeNoteId);
        renderTagFilter();
        alert(`成功导入 ${imported.length} 个笔记`);
      } catch {
        alert('备份文件解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    fileRestoreEl.value = '';
  });

  // --- F2.8: Keyboard Shortcuts ---
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && e.key === 'n') {
      e.preventDefault();
      const note = createNote();
      selectNote(note.id);
      editorEl.focus();
    }

    if (mod && e.key === 's') {
      e.preventDefault();
      clearTimeout(saveTimer);
      const note = getActiveNote();
      if (note) {
        note.content = editorEl.value;
      }
      saveNotes();
      showSaveStatus();
    }

    if (mod && e.key === 'f') {
      e.preventDefault();
      searchBox.focus();
      searchBox.select();
    }
  });

  // --- Mobile ---
  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      sidebarEl.classList.remove('open');
    }
  }

  sidebarToggle.addEventListener('click', () => {
    sidebarEl.classList.toggle('open');
  });

  viewToggle.addEventListener('click', () => {
    const isActive = previewPane.classList.toggle('active');
    viewToggle.classList.toggle('preview-active', isActive);
    viewToggle.textContent = isActive ? '编辑' : '预览';
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sidebarEl.classList.contains('open') &&
        !sidebarEl.contains(e.target) &&
        e.target !== sidebarToggle) {
      sidebarEl.classList.remove('open');
    }
  });

  // --- Welcome Note ---
  function createWelcomeNote() {
    const welcomeContent = `# 欢迎使用 Markdown Notes

这是一个轻量级的 Markdown 笔记应用。你可以在左侧编辑器中书写 Markdown，右侧实时预览渲染效果。

## 常用 Markdown 语法

### 标题

使用 \`#\` 号表示标题级别：

# 一级标题
## 二级标题
### 三级标题

### 文本格式

- **粗体文本** 使用 \`**文本**\`
- *斜体文本* 使用 \`*文本*\`
- ~~删除线~~ 使用 \`~~文本~~\`

### 列表

无序列表：
- 项目一
- 项目二
- 项目三

有序列表：
1. 第一步
2. 第二步
3. 第三步

### 链接和图片

[访问 GitHub](https://github.com)

![图片描述](https://via.placeholder.com/150)

### 引用

> 这是一段引用文字。
> 可以有多行。

### 代码

行内代码：\`console.log('Hello')\`

代码块：

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

### 表格

| 功能 | 快捷方式 | 说明 |
|------|----------|------|
| 新建 | Ctrl+N | 创建新笔记 |
| 保存 | Ctrl+S | 手动保存 |
| 搜索 | Ctrl+F | 聚焦搜索框 |
| 重命名 | 双击标题 | 修改笔记名称 |
| 删除 | 点击 × | 删除笔记 |

### 分割线

---

开始写你的第一个笔记吧！`;

    return createNote('欢迎使用 Markdown Notes', welcomeContent);
  }

  // --- Init ---
  function init() {
    const stored = loadNotes();
    if (stored && stored.length > 0) {
      notes = stored.map(n => ({
        ...n,
        tags: n.tags || []
      }));
      sortNotes();
      activeNoteId = notes[0].id;
    } else {
      const welcome = createWelcomeNote();
      activeNoteId = welcome.id;
    }
    renderTagFilter();
    renderNoteList();
    selectNote(activeNoteId);
  }

  init();
})();

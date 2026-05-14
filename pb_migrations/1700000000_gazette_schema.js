migrate((app) => {
  const classes = new Collection({
    name: "classes",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "code", type: "text", required: true },
      { name: "school", type: "text" },
      { name: "year", type: "number", required: true },
      { name: "theme", type: "text" },
      { name: "lock_date", type: "date" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_classes_code ON classes (code)",
    ],
  });

  const members = new Collection({
    name: "members",
    type: "base",
    fields: [
      { name: "class_id", type: "relation", required: true, collectionId: "classes", maxSelect: 1 },
      { name: "user_id", type: "text" },
      { name: "name", type: "text", required: true },
      { name: "email", type: "email" },
      { name: "quote", type: "text" },
      { name: "future", type: "text" },
      { name: "song", type: "text" },
      { name: "role", type: "text" },
      { name: "avatar_url", type: "url" },
      { name: "photo_url", type: "url" },
      { name: "member_type", type: "select", required: true, maxSelect: 1, values: ["graduate", "faculty"] },
      { name: "is_profile_complete", type: "bool" },
      { name: "nfc_programmed", type: "bool" },
      { name: "sort_order", type: "number" },
    ],
    indexes: [
      "CREATE INDEX idx_members_class ON members (class_id)",
    ],
  });

  const guestbook = new Collection({
    name: "guestbook_entries",
    type: "base",
    fields: [
      { name: "member_id", type: "relation", required: true, collectionId: "members", maxSelect: 1 },
      { name: "author_id", type: "relation", required: true, collectionId: "members", maxSelect: 1 },
      { name: "message", type: "text", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_guestbook_member ON guestbook_entries (member_id)",
    ],
  });

  const capsule = new Collection({
    name: "time_capsule_messages",
    type: "base",
    fields: [
      { name: "member_id", type: "relation", required: true, collectionId: "members", maxSelect: 1 },
      { name: "author_id", type: "relation", required: true, collectionId: "members", maxSelect: 1 },
      { name: "message", type: "text", required: true },
      { name: "open_date", type: "date", required: true },
      { name: "is_sealed", type: "bool" },
    ],
    indexes: [
      "CREATE INDEX idx_capsule_member ON time_capsule_messages (member_id)",
    ],
  });

  const wills = new Collection({
    name: "senior_wills",
    type: "base",
    fields: [
      { name: "class_id", type: "relation", required: true, collectionId: "classes", maxSelect: 1 },
      { name: "from_member_id", type: "relation", required: true, collectionId: "members", maxSelect: 1 },
      { name: "to_recipient", type: "text", required: true },
      { name: "item", type: "text", required: true },
    ],
  });

  const superlatives = new Collection({
    name: "superlatives",
    type: "base",
    fields: [
      { name: "class_id", type: "relation", required: true, collectionId: "classes", maxSelect: 1 },
      { name: "title", type: "text", required: true },
      { name: "winner_id", type: "relation", collectionId: "members", maxSelect: 1 },
    ],
  });

  const timeline = new Collection({
    name: "timeline_events",
    type: "base",
    fields: [
      { name: "class_id", type: "relation", required: true, collectionId: "classes", maxSelect: 1 },
      { name: "month", type: "text", required: true },
      { name: "event_name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "event_date", type: "date" },
      { name: "sort_order", type: "number" },
    ],
  });

  app.dao.saveCollection(classes);
  app.dao.saveCollection(members);
  app.dao.saveCollection(guestbook);
  app.dao.saveCollection(capsule);
  app.dao.saveCollection(wills);
  app.dao.saveCollection(superlatives);
  app.dao.saveCollection(timeline);
}, (app) => {
  const names = ["timeline_events", "superlatives", "senior_wills", "time_capsule_messages", "guestbook_entries", "members", "classes"];
  for (const name of names) {
    try {
      const col = app.dao.findCollectionByNameOrId(name);
      app.dao.deleteCollection(col);
    } catch (e) {}
  }
});

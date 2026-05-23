import "server-only";

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      name
      email
      account {
        id
        name
      }
    }
  }
`;

export const BOARDS_LIST_QUERY = /* GraphQL */ `
  query BoardsList($limit: Int = 50) {
    boards(limit: $limit, state: active) {
      id
      name
      board_kind
      state
      items_count
      workspace {
        id
        name
      }
    }
  }
`;

export const BOARD_META_QUERY = /* GraphQL */ `
  query BoardMeta($boardId: [ID!]) {
    boards(ids: $boardId) {
      id
      name
      description
      state
      items_count
      groups {
        id
        title
        color
      }
      columns {
        id
        title
        type
        settings_str
      }
    }
  }
`;

export const BOARD_ITEMS_QUERY = /* GraphQL */ `
  query BoardItems($boardId: [ID!], $cursor: String, $limit: Int = 100) {
    boards(ids: $boardId) {
      id
      name
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
          state
          created_at
          updated_at
          group {
            id
            title
          }
          column_values {
            id
            type
            text
            value
          }
        }
      }
    }
  }
`;

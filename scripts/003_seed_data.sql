-- Insert default global connectors
INSERT INTO public.connectors (id, name, description, category, auth_type, icon, color, website, is_official) VALUES
  ('google-drive', 'Google Drive', 'Access and manage files in Google Drive', 'storage', 'oauth2', '📁', '#4285F4', 'https://drive.google.com', true),
  ('dropbox', 'Dropbox', 'Store and share files with Dropbox', 'storage', 'oauth2', '📦', '#0061FF', 'https://dropbox.com', true),
  ('openai', 'OpenAI', 'Connect to OpenAI''s GPT models', 'ai', 'api_key', '🤖', '#10A37F', 'https://openai.com', true),
  ('anthropic', 'Anthropic', 'Connect to Claude models', 'ai', 'api_key', '🧠', '#D4A574', 'https://anthropic.com', true),
  ('slack', 'Slack', 'Send messages and notifications to Slack', 'communication', 'oauth2', '💬', '#4A154B', 'https://slack.com', true),
  ('notion', 'Notion', 'Read and write to Notion databases', 'productivity', 'oauth2', '📝', '#000000', 'https://notion.so', true),
  ('github', 'GitHub', 'Access GitHub repositories and issues', 'productivity', 'oauth2', '🐙', '#181717', 'https://github.com', true),
  ('postgres', 'PostgreSQL', 'Connect to PostgreSQL databases', 'database', 'basic', '🐘', '#336791', 'https://postgresql.org', true),
  ('mcp-filesystem', 'MCP Filesystem', 'Model Context Protocol for file operations', 'mcp', 'mcp', '📂', '#F59E0B', null, true),
  ('mcp-memory', 'MCP Memory', 'Model Context Protocol for knowledge graphs', 'mcp', 'mcp', '🧩', '#8B5CF6', null, true);

-- Insert default global tools
INSERT INTO public.tools (id, workspace_id, name, description, input_schema, category, is_global) VALUES
  (uuid_generate_v4(), null, 'web_search', 'Search the web for current information', '{"query": {"type": "string", "description": "Search query"}}'::jsonb, 'web', true),
  (uuid_generate_v4(), null, 'get_weather', 'Get current weather for a location', '{"location": {"type": "string", "description": "City name"}}'::jsonb, 'data', true),
  (uuid_generate_v4(), null, 'calculate', 'Perform mathematical calculations', '{"expression": {"type": "string", "description": "Math expression"}}'::jsonb, 'utility', true),
  (uuid_generate_v4(), null, 'code_interpreter', 'Execute Python code and return results', '{"code": {"type": "string", "description": "Python code to execute"}}'::jsonb, 'code', true),
  (uuid_generate_v4(), null, 'file_search', 'Search through uploaded files', '{"query": {"type": "string", "description": "Search query"}}'::jsonb, 'data', true);

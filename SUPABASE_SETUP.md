# Configuração do Supabase - Guia Completo

Este guia irá te ajudar a configurar o Supabase manualmente para o AgentKit.

## Passo 1: Criar Projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha um nome e senha para o banco de dados
5. Aguarde a criação do projeto (leva alguns minutos)

## Passo 2: Executar Scripts SQL

1. No seu projeto Supabase, vá em **SQL Editor** no menu lateral
2. Clique em "+ New Query"
3. Copie e cole o script consolidado abaixo
4. Clique em "Run" para executar

### Script Consolidado (Execute Tudo de Uma Vez)

```sql
-- ============================================
-- SCRIPT COMPLETO DE SETUP DO AGENTKIT
-- Execute todo este script de uma vez só
-- ============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de perfis (estende auth.users do Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de workspaces (multi-tenant)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de membros de workspace
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Tabela de agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tools TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tools
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  category TEXT NOT NULL,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de workflows
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  nodes JSONB NOT NULL DEFAULT '[]',
  connections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de versões de workflows
CREATE TABLE public.workflow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  nodes JSONB NOT NULL,
  connections JSONB NOT NULL,
  tag TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, version)
);

-- Tabela de execuções de workflows
CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input TEXT,
  result JSONB,
  steps JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT
);

-- Tabela de runs (playground)
CREATE TABLE public.runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  messages JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration INTEGER
);

-- Tabela de connectors
CREATE TABLE public.connectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  website TEXT,
  is_official BOOLEAN DEFAULT false
);

-- Tabela de connections (instâncias de connectors)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  connector_id TEXT REFERENCES public.connectors(id) NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'error')),
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de servidores MCP
CREATE TABLE public.mcp_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('http', 'stdio')),
  url TEXT,
  command TEXT,
  args TEXT[],
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'error')),
  capabilities JSONB DEFAULT '{}',
  tools JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_agents_workspace ON public.agents(workspace_id);
CREATE INDEX idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX idx_executions_workflow ON public.workflow_executions(workflow_id);
CREATE INDEX idx_executions_workspace ON public.workflow_executions(workspace_id);
CREATE INDEX idx_runs_workspace ON public.runs(workspace_id);
CREATE INDEX idx_runs_agent ON public.runs(agent_id);
CREATE INDEX idx_connections_workspace ON public.connections(workspace_id);
CREATE INDEX idx_mcp_servers_workspace ON public.mcp_servers(workspace_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON public.mcp_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para workspaces
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete workspaces"
  ON public.workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Políticas para workspace_members
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Políticas para agents
CREATE POLICY "Users can view agents in their workspaces"
  ON public.agents FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create agents"
  ON public.agents FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update agents"
  ON public.agents FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete agents"
  ON public.agents FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Políticas para tools
CREATE POLICY "Users can view tools in their workspaces or global tools"
  ON public.tools FOR SELECT
  USING (
    is_global = true OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create tools"
  ON public.tools FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Políticas para workflows
CREATE POLICY "Users can view workflows in their workspaces"
  ON public.workflows FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update workflows"
  ON public.workflows FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete workflows"
  ON public.workflows FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Políticas para workflow_versions
CREATE POLICY "Users can view workflow versions in their workspaces"
  ON public.workflow_versions FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Editors can create workflow versions"
  ON public.workflow_versions FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
      )
    )
  );

-- Políticas para workflow_executions
CREATE POLICY "Users can view executions in their workspaces"
  ON public.workflow_executions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create executions"
  ON public.workflow_executions FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their executions"
  ON public.workflow_executions FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para runs
CREATE POLICY "Users can view runs in their workspaces"
  ON public.runs FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create runs"
  ON public.runs FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update runs"
  ON public.runs FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para connections
CREATE POLICY "Users can view connections in their workspaces"
  ON public.connections FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage connections"
  ON public.connections FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Políticas para mcp_servers
CREATE POLICY "Users can view MCP servers in their workspaces"
  ON public.mcp_servers FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can manage MCP servers"
  ON public.mcp_servers FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ============================================
-- FUNÇÕES AUTOMÁTICAS
-- ============================================

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para criar workspace padrão
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (
    'My Workspace',
    'my-workspace-' || substring(NEW.id::text from 1 for 8),
    NEW.id
  )
  RETURNING id INTO workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar workspace padrão
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_workspace();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Connectors padrão
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

-- Tools globais
INSERT INTO public.tools (id, workspace_id, name, description, input_schema, category, is_global) VALUES
  (uuid_generate_v4(), null, 'web_search', 'Search the web for current information', '{"query": {"type": "string", "description": "Search query"}}'::jsonb, 'web', true),
  (uuid_generate_v4(), null, 'get_weather', 'Get current weather for a location', '{"location": {"type": "string", "description": "City name"}}'::jsonb, 'data', true),
  (uuid_generate_v4(), null, 'calculate', 'Perform mathematical calculations', '{"expression": {"type": "string", "description": "Math expression"}}'::jsonb, 'utility', true),
  (uuid_generate_v4(), null, 'code_interpreter', 'Execute Python code and return results', '{"code": {"type": "string", "description": "Python code to execute"}}'::jsonb, 'code', true),
  (uuid_generate_v4(), null, 'file_search', 'Search through uploaded files', '{"query": {"type": "string", "description": "Search query"}}'::jsonb, 'data', true);

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
```

## Passo 3: Configurar Variáveis de Ambiente

1. No seu projeto Supabase, vá em **Settings → API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (uma chave longa começando com `eyJ...`)

3. No v0, clique em **Vars** na barra lateral
4. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## Passo 4: Testar a Conexão

1. Acesse a página `/setup` no app
2. Clique em "Test Connection"
3. Se tudo estiver correto, você verá "✓ Connection successful"

## Passo 5: Criar Sua Conta

1. Acesse `/signup` no app
2. Crie sua conta com email e senha
3. Verifique seu email (Supabase envia link de confirmação)
4. Faça login em `/login`

Pronto! Seu AgentKit está configurado com Supabase.

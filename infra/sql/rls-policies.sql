-- Row Level Security (RLS) Policies for Multi-Tenant Data Protection
-- This ensures that when proper authorization is implemented, tenants can only access their own data

-- Enable RLS on all tenant-specific tables
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant_profiles
CREATE POLICY tenant_profiles_tenant_isolation ON tenant_profiles
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Create RLS policies for tenant_references
CREATE POLICY tenant_references_tenant_isolation ON tenant_references
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Create RLS policies for proposal_layouts
CREATE POLICY proposal_layouts_tenant_isolation ON proposal_layouts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Create RLS policies for proposal_content
CREATE POLICY proposal_content_tenant_isolation ON proposal_content
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Create a function to set the current tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql;

-- Create a function to clear the tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', '', false);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the context functions
GRANT EXECUTE ON FUNCTION set_tenant_context(text) TO postgres;
GRANT EXECUTE ON FUNCTION clear_tenant_context() TO postgres;

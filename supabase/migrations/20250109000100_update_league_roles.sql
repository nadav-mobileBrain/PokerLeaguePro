-- Update league roles to simplified system
-- Keep league_admin and member roles, remove viewer

-- Keep existing league_admin roles unchanged
-- (no update needed for league_admin)

-- Convert viewers to members (since we're removing viewer role)
UPDATE league_members 
SET role = 'member' 
WHERE role = 'viewer';

-- Drop the old constraint
ALTER TABLE league_members 
DROP CONSTRAINT IF EXISTS league_members_role_check;

-- Add new constraint with league_admin and member roles
ALTER TABLE league_members 
ADD CONSTRAINT league_members_role_check 
CHECK (role IN ('league_admin', 'member')); 
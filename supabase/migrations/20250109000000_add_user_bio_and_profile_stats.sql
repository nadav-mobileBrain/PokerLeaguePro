-- Add bio column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create function to get user profile statistics
-- This initial version returns default values, will be updated once we understand the schema
CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
    -- Return default stats for now - will update based on actual table structure
    RETURN json_build_object(
        'total_games', 0,
        'total_profit', 0,
        'average_profit_per_game', 0,
        'win_rate', 0,
        'total_buy_ins', 0,
        'best_single_game', 0,
        'worst_single_game', 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Create Reviews Table

CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    submission_id UUID REFERENCES submissions(id) NOT NULL,
    provider_id UUID REFERENCES users(id), -- Optional, denormalized for easier query
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images JSONB DEFAULT '[]', -- Array of image URLs
    reply_content TEXT, -- Provider's reply
    reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON reviews(submission_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read reviews" ON reviews
    FOR SELECT USING (true);

-- Update provider rating trigger (Optional, intricate to implement without functions)

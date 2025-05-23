-- DROP FUNCTION IF EXISTS get_pruned_graph(BIGINT, BIGINT, DOUBLE PRECISION);

CREATE OR REPLACE FUNCTION get_vertices_in_ellipse( vertex_a_id BIGINT, vertex_b_id BIGINT, scale_factor FLOAT DEFAULT 1.3 ) RETURNS SETOF vertices AS $$ DECLARE a_lat FLOAT; a_lon FLOAT; b_lat FLOAT; b_lon FLOAT; distance_ab FLOAT; max_distance FLOAT; BEGIN -- Get coordinates of vertex A SELECT latitude, longitude INTO a_lat, a_lon FROM vertices WHERE id = vertex_a_id;

-- Get coordinates of vertex B SELECT latitude, longitude INTO b_lat, b_lon FROM vertices WHERE id = vertex_b_id;

-- If either vertex doesn't exist, return empty set IF a_lat IS NULL OR b_lat IS NULL THEN RETURN; END IF;

-- Calculate direct distance between A and B -- Using simplified distance calculation for efficiency distance_ab = SQRT(POWER(a_lat - b_lat, 2) + POWER(a_lon - b_lon, 2));

-- Calculate maximum allowed distance (sum of distances to foci) -- We multiply by scale_factor to make ellipse slightly larger max_distance = distance_ab scale_factor;

-- Return all vertices that lie within the ellipse RETURN QUERY SELECT v. FROM vertices v WHERE -- The defining property of an ellipse: sum of distances to two foci is constant SQRT(POWER(v.latitude - a_lat, 2) + POWER(v.longitude - a_lon, 2)) + SQRT(POWER(v.latitude - b_lat, 2) + POWER(v.longitude - b_lon, 2)) <= max_distance -- Exclude vertices that are extremely close to the straight line between A and B AND NOT ( -- Simple check for points on the line ABS( (b_lat - a_lat) * (v.longitude - a_lon) - (b_lon - a_lon) * (v.latitude - a_lat) ) / distance_ab < 0.0001 AND -- Check if point is between A and B (v.latitude BETWEEN LEAST(a_lat, b_lat) AND GREATEST(a_lat, b_lat)) AND (v.longitude BETWEEN LEAST(a_lon, b_lon) AND GREATEST(a_lon, b_lon)) ); END; $$ LANGUAGE plpgsql;

-- Function to get both vertices and the edges connecting them within an ellipse CREATE OR REPLACE FUNCTION get_pruned_graph( vertex_a_id BIGINT, vertex_b_id BIGINT, scale_factor FLOAT DEFAULT 1.3 ) RETURNS TABLE( vertex_id BIGINT, vertex_lat FLOAT, vertex_lon FLOAT, vertex_data JSON, edge_id BIGINT, edge_source BIGINT, edge_target BIGINT, edge_weight BIGINT, edge_is_pedestrian BOOLEAN, edge_data JSON ) AS $$ BEGIN RETURN QUERY WITH ellipse_vertices AS ( SELECT id FROM get_vertices_in_ellipse(vertex_a_id, vertex_b_id, scale_factor) ) SELECT v.id, v.latitude, v.longitude, v.data::JSON, e.id, e.source, e.target, e.weight, e.isPedestrian, e.data::JSON FROM vertices v LEFT JOIN edges e ON (e.source = v.id OR e.target = v.id) WHERE v.id IN (SELECT id FROM ellipse_vertices) AND ( e.source IN (SELECT id FROM ellipse_vertices) AND e.target IN (SELECT id FROM ellipse_vertices) ); END; $$ LANGUAGE plpgsql;

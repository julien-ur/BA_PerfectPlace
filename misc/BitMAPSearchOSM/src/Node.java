import java.util.ArrayList;

/**
 * Each defined Element in OpenStreetMap contains Nodes. Either there are Nodes
 * with describing tags, or ways with several nodes and tags. Nodes have some
 * information. Only those, which are important for the program, are saved in
 * this Node-Class. The id is needed for the WayNodes, which use the ids as
 * reference. The latitude and the longitude are the essential variables, as
 * they are used to visualize the Nodes in the map-image(after the are converted
 * to pixel).
 * 
 * @author Judith Höreth
 * 
 */
public class Node {
	String id;
	boolean visible;
	float lat, lon;
	private ArrayList<Tag> allTags;

	public Node() {

	}

	public Node(String id, boolean visible, float lat, float lon,
			ArrayList<Tag> allTags) {
		this.id = id;
		this.visible = visible;
		this.lat = lat;
		this.lon = lon;
		this.allTags = allTags;
		allTags = new ArrayList<Tag>();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	public float getLat() {
		return lat;
	}

	public void setLat(float lat) {
		this.lat = lat;
	}

	public float getLon() {
		return lon;
	}

	public void setLon(float lon) {
		this.lon = lon;
	}

	public void setTags(ArrayList<Tag> allTags) {
		this.allTags = allTags;

	}

	public ArrayList<Tag> getAllTags() {
		return allTags;
	}

}

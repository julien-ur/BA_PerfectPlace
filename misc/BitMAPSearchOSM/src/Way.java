import java.util.ArrayList;

/**
 * A Way is a accumulation of several Nodes, which describe a specific form in
 * the map(for example a building, a park, a river,...). It can have one or more
 * tags, which describe the Way.
 * 
 * @author Judith Höreth
 * 
 */
public class Way {

	int id;
	boolean visible;
	ArrayList<Tag> tags;
	ArrayList<WayNode> wayNodes;

	public Way() {

	}

	public Way(int id, boolean visible, ArrayList<WayNode> wayNodes,
			ArrayList<Tag> tags) {
		this.id = id;
		this.visible = visible;
		this.wayNodes = wayNodes;
		this.tags = tags;
		tags = new ArrayList<Tag>();
		wayNodes = new ArrayList<WayNode>();
	}

	void setId(int id) {
		this.id = id;
	}

	int getId() {
		return id;
	}

	void setVisible(boolean visible) {
		this.visible = visible;
	}

	boolean getVisible() {
		return visible;
	}

	void setWayNodes(ArrayList<WayNode> wayNodes) {
		this.wayNodes = wayNodes;
	}

	ArrayList<WayNode> getWayNodes() {
		return wayNodes;
	}

	void setTags(ArrayList<Tag> tags) {
		this.tags = tags;
	}

	ArrayList<Tag> getTags() {
		return tags;
	}
}

/**
 * The class WayNode defines the Nodes which are referenced in a Way. It only
 * contains a reference String, which presents the id of each Node, the Way has.
 * 
 * @author Judith Höreth
 * 
 */
public class WayNode {
	String ref;

	public WayNode() {
	}

	public WayNode(String ref) {
		this.ref = ref;
	}

	void setRef(String ref) {
		this.ref = ref;
	}

	String getRef() {
		return ref;
	}

}

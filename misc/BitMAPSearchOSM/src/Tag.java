/**
 * Tags describe Nodes or Ways. They may contain the type of the tagged Item, or
 * other information, for example about the address or the information source.
 * The k-String defines a group and the v-String gives the specific information.
 * (For example: k="leisure", v="playground")
 * 
 * @author Judith Höreth
 * 
 */
public class Tag {
	String k, v;

	public Tag() {
	}

	public Tag(String k, String v) {
		this.k = k;
		this.v = v;
	}

	void setK(String k) {
		this.k = k;
	}

	String getK() {
		return k;
	}

	void setV(String v) {
		this.v = v;
	}

	String getV() {
		return v;
	}

}

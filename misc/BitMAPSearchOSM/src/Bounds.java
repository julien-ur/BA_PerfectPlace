/**
 * The Bounds define the area which is displayed in the map-image. The data in the
 * osm-file only contains information within these bounds.
 * 
 * @author Judith Höreth
 * 
 */
public class Bounds {

	float minlat, maxlat, minlon, maxlon;

	public Bounds() {
	}

	public Bounds(float minlat, float minlon, float maxlat, float maxlon) {
		this.minlat = minlat;
		this.minlon = minlon;
		this.maxlat = maxlat;
		this.maxlon = maxlon;
	}

	float getMinlat() {
		return minlat;
	}

	void setMinlat(float minlat) {
		this.minlat = minlat;
	}

	float getMinlon() {
		return minlon;
	}

	void setMinlon(float minlon) {
		this.minlon = minlon;
	}

	float getMaxlat() {
		return maxlat;
	}

	void setMaxlat(float maxlat) {
		this.maxlat = maxlat;
	}

	float getMaxlon() {
		return maxlon;
	}

	void setMaxlon(float maxlon) {
		this.maxlon = maxlon;
	}

}

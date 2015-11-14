/**
 * This class calls the different map-informations from the MapInformation class
 * and converts the lat/lon data in pixeldata to visualize them on the UI.
 * 
 * @author Judith Höreth
 * 
 */

public class MapToPixel {
	private float oneLatPixel, oneLonPixel, latArea, lonArea;
	MapInformation mI;
	private Bounds myBounds;

	public MapToPixel(MapInformation mI) {
		this.mI = mI;
		myBounds = mI.getBounds();
		setPixelSize();
	}

	private void setPixelSize() {
		latArea = myBounds.getMaxlat() - myBounds.getMinlat();
		lonArea = myBounds.getMaxlon() - myBounds.getMinlon();
		oneLatPixel = Values.HEIGHT / latArea;
		oneLonPixel = Values.WIDTH / lonArea;
	}

	float getYInMapBitmap(float lat) {
		float tempLat = myBounds.getMaxlat() - lat;
		float pixel = tempLat * oneLatPixel;
		return pixel;
	}

	float getXInMapBitmap(float lon) {
		float tempLon = lon - myBounds.getMinlon();
		float pixel = tempLon * oneLonPixel;
		return pixel;
	}

	float getLongitude(float pixel) {
		float lon = 0;
		float tempLon = 0;
		float minLon = myBounds.getMinlon();
		tempLon = pixel / oneLonPixel;
		lon = tempLon + minLon;
		return lon;
	}

	float getLatitude(float pixel) {
		float lat = 0;
		float tempLat = 0;
		float maxLat = myBounds.getMaxlat();
		tempLat = pixel / oneLatPixel;
		lat = maxLat - tempLat;
		return lat;
	}

	/**
	 * adapts the dilateValue to the size of the map. The given dilate-value is
	 * divided by the average of both values.
	 * 
	 * @param dilate
	 *            value, which is set in the interface
	 * @return real dilate-value to be used for the operation (adapted to the
	 *         size of the map)
	 */
	int getDilateValue(int dilate) {
		float dilateNew = (1.5f / ((lonArea + latArea) / 2));
		if (dilate != 1) {
			dilateNew = dilateNew * 2.5f * (dilate - 1);
		}
		return (int) dilateNew;
	}

	/**
	 * The size of each icon has to be adapted to the size of the map-
	 * 
	 * @return adapted size for the icon
	 */
	public int getIconSize() {
		float area = (lonArea + latArea) / 2;
		int biggerSizeValue = 1;
		if (area > 0.05f) {
			biggerSizeValue = 2;
		}
		int iconSizeNew = (int) (0.5f / area) * biggerSizeValue;
		return iconSizeNew;
	}
}

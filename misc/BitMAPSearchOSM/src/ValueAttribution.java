import java.awt.Color;
import java.awt.image.BufferedImage;

/**
 * This class contains several method to initialize variables and to attribute
 * given values to other values.
 * 
 * @author Judith Höreth
 * 
 */
public class ValueAttribution {
	AppletValues appV;

	public ValueAttribution(AppletValues appV) {
		this.appV = appV;
	}

	/**
	 * This method gives each importance-value one color. The more important,
	 * the brighter the color will be. Additionally the alpha-value is adapted
	 * to the type of layer, as layers are drawn one upon the other. (First
	 * layers are overlays of semi-transparent layers and need to display areas
	 * in stronger colors than the layers above to get approximate the same
	 * color for each layer when they are overlapped).
	 * 
	 * @param importance
	 *            value(0,1 or 2)
	 * @param layer
	 *            determination of layer for drawing process
	 * @param layers
	 *            array of all layers
	 * @return color, which is used to draw the area
	 */
	Color getColor(int importance, BufferedImage layer, BufferedImage[] layers,
			int queryType) {
		int greyValue = 0, greyValuePos = 0, greyValueNeg = 0;
		float layerValue = getLayerValue(layer, layers);
		switch (importance) {
		case Values.VERY_IMPORTANT:
			greyValuePos = (int) (255 * layerValue);
			greyValueNeg = 0;
			break;
		case Values.IMPORTANT:
			greyValuePos = (int) (200 * layerValue);
			greyValueNeg = (int) (15 * layerValue);
			break;
		case Values.NOT_IMPORTANT:
			greyValuePos = (int) (150 * layerValue);
			greyValueNeg = (int) (30 * layerValue);
			break;
		}
		if (queryType == Values.POSITIVE) {
			greyValue = greyValuePos;
		} else {
			greyValue = greyValueNeg;
		}
		Color c = new Color(greyValue, greyValue, greyValue);
		return c;
	}

	/**
	 * Depending on the layer, the alpha value for the representation is
	 * calculated.
	 * 
	 * @param layer
	 *            determination of layer for drawing process
	 * @param layers
	 *            array of all layers
	 * @return scale float for the alpha-value
	 */
	private float getLayerValue(BufferedImage layer, BufferedImage[] layers) {
		float value = 0;
		for (int i = 0; i < layers.length; i++) {
			if (layer == layers[i]) {
				value = Values.SCALE_ALPHA_ARRAY[i];
			}
		}
		return value;
	}

	/**
	 * This method assigns a given amenity-string a query-string, which can be
	 * used for later search-operations.
	 * 
	 * @param text
	 *            String of the selected combobox-item.
	 * @return query-string, which can be used to search in the osm-file.
	 */
	String getQuery(String text) {
		String query = "";
		for (int i = 0; i < QueryValues.ALL_SUB_AMENITIES.length; i++) {
			if (QueryValues.ALL_SUB_AMENITIES[i] != null) {
				for (int j = 0; j < QueryValues.ALL_SUB_AMENITIES[i].length; j++) {
					if (text.equals(QueryValues.ALL_SUB_AMENITIES[i][j])) {
						query = QueryValues.ALL_QUERIES[i][j];
					}
				}
			}
		}
		return query;
	}

	/**
	 * This methods saves the amenities which belong to the chosen category
	 * 
	 * @param item
	 *            chosen category
	 * @return an array of appropriate amenities
	 */
	String[] getSubAmenities(String item) {
		String[] amenities = null;
		for (int i = 0; i < QueryValues.AMENITIES.length - 1; i++) {
			if (item.equals(QueryValues.AMENITIES[i])) {
				amenities = QueryValues.ALL_SUB_AMENITIES[i];
			}
		}
		return amenities;
	}

}

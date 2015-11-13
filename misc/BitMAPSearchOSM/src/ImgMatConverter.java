import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

/**
 * This class contains two methods. One method to convert a BufferedImage to a
 * Mat and another to do the converse. These converts are important for the
 * filter used in the MyApplet-class.
 * 
 * @author Judith Höreth
 * 
 */
public class ImgMatConverter {

	public ImgMatConverter() {
	}

	public BufferedImage mat2Img(Mat in) {
		byte[] data = new byte[in.rows() * in.cols() * (int) (in.elemSize())];
		in.get(0, 0, data);
		if (in.channels() == 3) {
			for (int i = 0; i < data.length; i += 3) {
				byte temp = data[i];
				data[i] = data[i + 2];
				data[i + 2] = temp;
			}
		}
		BufferedImage image = new BufferedImage(in.cols(), in.rows(),
				BufferedImage.TYPE_3BYTE_BGR);
		image.getRaster().setDataElements(0, 0, in.cols(), in.rows(), data);
		return image;
	}

	public Mat bufferedImg2Mat(BufferedImage im) {
		byte[] data = ((DataBufferByte) im.getRaster().getDataBuffer())
				.getData();
		Mat mat = new Mat(im.getHeight(), im.getWidth(), CvType.CV_8UC3);
		mat.put(0, 0, data);
		return mat;
	}

}

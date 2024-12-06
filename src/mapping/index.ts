import { Client } from "@elastic/elasticsearch";
import { MyIndexMapping } from "./my_index_mapping";

export const checkIndex = async (client: Client, index) => {
  // Kiểm tra index đã tồn tại chưa
  const indexExists = await client.indices.exists({
    index: index,
  });
  if (!indexExists) {
    // Tạo index với mapping
    await client.indices.create({
      index: index,
      body: MyIndexMapping,
    });
    console.log(`Index ${index} created successfully.`);
  } else {
    // Đồng bộ mapping nếu cần thiết
    await syncMapping(client, index, MyIndexMapping.mappings.properties);
  }
};

export async function syncMapping(
  client: Client,
  index: string,
  properties: Record<string, any>
) {
  const currentMapping = await client.indices.getMapping({
    index,
  });

  // Lấy danh sách các trường hiện tại
  const existingFields = Object.keys(currentMapping[index].mappings.properties);

  // Kiểm tra và thêm các trường mới nếu cần
  const newFields = Object.keys(properties).filter(
    (field) => !existingFields.includes(field)
  );
  if (newFields.length > 0) {
    const newProperties = newFields.reduce((acc, field) => {
      acc[field] = properties[field];
      return acc;
    }, {});
    await client.indices.putMapping({
      index,
      body: { properties: newProperties },
    });
    console.log(`Mapping updated successfully for index ${index}`);
  }
}
